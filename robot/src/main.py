import argparse
import json
import logging
import os
import signal
import sys
import time
import socket
import random
from time import sleep

from chunk_manager import slicer
from chunk_manager import stitcher
from utils import networking
from simulation.coordinate_simulator import Circle_Walk_Simulator
from simulation.map_simulator import Map_Simulator

# Constants
SLEEP_TIME = 5
CREATE_CHUNK_TOPIC = "iot/chunks/create"
NEW_CHUNK_TOPIC = "iot/chunks/advertisement"  # <=> PUBLISH_CHUNK_TOPIC

try:
    MQTT_BROKER = os.environ["MQTT_BROKER"]
    MQTT_PORT = int(os.environ["MQTT_PORT"])
except KeyError as e:
    logging.error(e)
    sys.exit(-1)


def f(old_chunk, new_chunk):
    # Calculate an arbitrary similarity metric. Here we count the differences and normalize them to the length.
    # A value of 1 implies that the chunks are equal, a value of 0 means they are entirely different.
    chunk_len = min(len(old_chunk), len(new_chunk))
    change = 0

    for i in range(chunk_len):
        if old_chunk[i] == new_chunk[i]:
            change += 1

    return 1 - ((1 + chunk_len - change) / (1 + chunk_len))


def select_chunks(old_chunk_list, new_chunk_list, fun, threshold):
    """ Returns a list of new chunks for which holds f(old_chunk, new_chunk) < threshold. """
    selected_chunks = []
    i = 0
    for old, new in zip(old_chunk_list, new_chunk_list):
        if fun(old, new) < threshold:
            selected_chunks.append((i, new))
        i += 1

    return selected_chunks


class ChunkManager:
    def __init__(self, meta_file, map_file, chunk_height=100, chunk_width=100):
        configuration = {
            "hostname": MQTT_BROKER,
            "port": MQTT_PORT
        }
        self.pubSubManager = networking.MQTTPubSubManager(configuration)
        self.network_chunk_buffer = []
        self.old_chunk_list = []
        self.pubSubManager.subscribe(NEW_CHUNK_TOPIC, self.receive_chunks)
        self.CHUNK_HEIGHT = chunk_height
        self.CHUNK_WIDTH = chunk_width
        self.META_FILE = meta_file
        self.MAP_FILE = map_file
        self.run = True

    def start(self):
        logging.debug("Start processing")
        m = None
        try:
            # Load meta from server
            m = networking.get_meta()
            logging.info("Retrieved meta.json from server")

            #run simulator
            if SIMULATOR:
                x_rand = random.randint(0, m["width"])
                y_rand = random.randint(0, m["height"])
                cw_sim = Circle_Walk_Simulator(x=x_rand, y=y_rand, m=m)
                m_sim = Map_Simulator(m)

            # Perform full map download for initialization
            amount_of_chunks = m['CHUNK_ROWS'] * m['CHUNK_COLS']
            logging.info('amount_of_chunks: {}'.format(amount_of_chunks))
            uncompressed_network_chunk_list = networking.get_chunks_bulk(amount_of_chunks)
            logging.info('Downloaded {} chunks from the cloud '.format(amount_of_chunks))
            
            # Export the network chunks to disk
            slicer.export_files(OUTPUT_DIR, uncompressed_network_chunk_list)
            logging.info("Exported files from network")

            # Stitch together the chunks from disk to get a new map
            local_chunk_list = stitcher.load_chunk_list_from_disk(m, OUTPUT_DIR)
            logging.info(len(local_chunk_list))
            self.stitch(m, local_chunk_list)
            self.old_chunk_list = local_chunk_list
            logging.info("Stitched the obtained chunks together")

        except Exception as e:
            # No meta available, upload the local meta file
            self.slice()

            m = stitcher.read_meta(self.META_FILE)
            logging.info('exception in meta {}'.format(m))
            networking.post_meta(m)
            logging.info("Posted meta.json to the cloud")

            #run simulator
            if SIMULATOR:
                x_rand = random.randint(0, m["width"])
                y_rand = random.randint(0, m["height"])
                cw_sim = Circle_Walk_Simulator(x=x_rand, y=y_rand, m=m)
                m_sim = Map_Simulator(m)

            # Fill old chunk list with demo values
            if not self.old_chunk_list:
                self.old_chunk_list = [[] for c in range(m["CHUNK_ROWS"] * m["CHUNK_COLS"])]

        iteration_no = 0
        while self.run:
            logging.debug("Iteration {} =========================================".format(iteration_no))
            
            #run simulator
            if SIMULATOR:
                x, y = cw_sim.step()
                # Perform map simulation step
                rnd = random.randint(0, 100)
                if rnd > 10:
                    # This is an arbitrary random magic number
                    m_sim.step(x, y)
                sleep(1)



            # Slice current local map state from robot
            logging.debug("Load chunk list from disk")
            self.slice()

            local_chunk_list = stitcher.load_chunk_list_from_disk(m, OUTPUT_DIR)
            # Merge local map state with network map state:

            # Process new chunks that were received over network
            logging.debug("Receiving {} chunks from the network".format(len(self.network_chunk_buffer)))

            network_chunk_list = [[] for c in range(m["CHUNK_ROWS"] * m["CHUNK_COLS"])]
            for chunk_row,chunk_column, new_network_chunk in self.network_chunk_buffer:
                network_chunk_list[chunk_row*m["CHUNK_COLS"]+chunk_column] = new_network_chunk
            # Reset network chunk buffer
            self.network_chunk_buffer = []  # TODO: This might lead to data loss! (Or at least it has race condition potential)

            new_chunk_list = []
            publish_bool = True
            for local_chunk, network_chunk in zip(local_chunk_list, network_chunk_list):
                if network_chunk:
                    publish_bool = False
                    new_chunk_list.append(network_chunk)
                else:
                    new_chunk_list.append(local_chunk)
            # Stitch merged chunks together and let the robot reload the map
            self.stitch(m, new_chunk_list)
            if publish_bool:
                # Publish new chunks if there are any (only if no new ones were added)
                selected_chunks = select_chunks(self.old_chunk_list, new_chunk_list, f, 0.998)
                logging.info("selected_chunks {}".format(len(selected_chunks)))
                self.publish_chunks(selected_chunks,m)

            # Update iteration logic
            self.old_chunk_list = new_chunk_list
            iteration_no += 1
            time.sleep(SLEEP_TIME)


    def stop(self):
        self.run = False

    def receive_chunks(self, mqttc, obj, msg):
        try:
            json_msg = json.loads(msg.payload)
            if msg.topic == NEW_CHUNK_TOPIC:
                self.process_new_network_chunk(json_msg)

        except Exception as e:
            # Ignore objects that cannot be parsed
            logging.warning("Chunk could not be deserialized: {raw_chunk}".format(raw_chunk=msg.payload))


    def process_new_network_chunk(self, chunk_network_obj):
        chunk_url = chunk_network_obj["chunkUrl"]
        chunk_row = chunk_network_obj["row"]
        chunk_column = chunk_network_obj["column"]
        robot_id = chunk_network_obj["robotId"]
        chunk = chunk_network_obj["chunk"]
        if robot_id != networking.ROBOT_ID: 
            chunk_decompressed = networking.parse_network_chunk(chunk)
            self.network_chunk_buffer.append((chunk_row, chunk_column, chunk_decompressed))

    def publish_chunks(self, selected_chunks, meta):
        logging.debug("Publishing {} chunks".format(len(selected_chunks)))
        for i, chunk in selected_chunks:
            compressed_bytes = slicer.compress_chunk([chunk])
            column = i % meta["CHUNK_COLS"]
            row = (int) (i / meta["CHUNK_COLS"])
            payload = networking.prepare_payload(compressed_bytes, row,column)
            self.pubSubManager.publish(CREATE_CHUNK_TOPIC, payload)
            time.sleep(0.1)


    def slice(self):
        # TODO: dynamically/periodically load map file
        pgm = slicer.read_file(self.MAP_FILE)
        pgm.init_chunk_params(CHUNK_WIDTH, CHUNK_HEIGHT)
        uncompressed_chunks = slicer.slice(pgm, OUTPUT_DIR)
        slicer.export_files(OUTPUT_DIR, uncompressed_chunks)

    def stitch(self, meta, chunk_list):
        stitch_result = stitcher.stitch_chunks(meta, chunk_list)
        stitch_file = os.path.join(OUTPUT_DIR, "map.pgm")
        stitcher.export_file(meta, stitch_file, stitch_result)

if __name__ == "__main__":
    logging.info("Chunk Manager v0.1")
    parser = argparse.ArgumentParser()
    parser.add_argument("--simulator", type=bool,dest="simulator", required=False)
    parser.add_argument("--file", dest="map_file", required=True)
    parser.add_argument("--meta", dest="meta_file", required=True)
    parser.add_argument("--output-dir", dest="output_dir", required=True)
    parser.add_argument("--chunk-width", type=int, dest="chunk_width", required=True)
    parser.add_argument("--chunk-height", type=int, dest="chunk_height", required=True)
    parser.add_argument("--debug", type=bool, dest="debug", required=False)

    args = parser.parse_args()
    OUTPUT_DIR = args.output_dir
    CHUNK_HEIGHT = args.chunk_height
    CHUNK_WIDTH = args.chunk_width
    MAP_FILE = args.map_file
    META_FILE = args.meta_file
    DEBUG = args.debug
    SIMULATOR = args.simulator


    if DEBUG:
        logging.getLogger().setLevel(logging.DEBUG)

    cm = ChunkManager(META_FILE, MAP_FILE, chunk_height=CHUNK_HEIGHT, chunk_width=CHUNK_WIDTH)


    # Register SIGINT handling
    # TODO: add more meaningful termination logic here;
    def signal_handler(signal, frame):
        logging.info("Performing graceful termination; waiting {t} seconds".format(t=SLEEP_TIME))
        cm.stop()
        time.sleep(SLEEP_TIME)
        sys.exit(0)


    signal.signal(signal.SIGINT, signal_handler)

    cm.start()
