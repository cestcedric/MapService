import json
import logging
import os
import random
import sys
import uuid
from time import sleep

from utils import networking

# Enable debug logging
logging.getLogger().setLevel(logging.DEBUG)

try:
    # Load constants and environment variables

    ROBOT_ID = os.environ["HOSTNAME"]
    UPDATE_FREQUENCY = int(os.environ["UPDATE_FREQUENCY"])  # Updates per second

    CREATE_CHUNK_TOPIC = "iot/chunks/create"
    NEW_CHUNK_TOPIC = "iot/chunks/publish"  # <=> PUBLISH_CHUNK_TOPIC
    CHUNK_ROWS = 40
    CHUNK_COLS = 40

    MQTT_BROKER = os.environ["MQTT_BROKER"]
    MQTT_PORT = int(os.environ["MQTT_PORT"])

except KeyError as e:
    logging.error(e)
    sys.exit(-1)


def generate_random_chunk_payload(chunk_index=None):
    # Provide random sample map chunk strings
    map_chunk_samples = [
        "eNrt1bENwCAMRcG//xgsSqRQRIIWLBHdda5eZbs1AAAAAAAAADborwxj6Cca+ZxqJFNkfyOZI9sbyRK5sZGVhsYVjb/sYMm9Krm7Jf+j5A/Odje4XO8P5Z8o/A==",
        "eNrt1rENgCAURVFXdBzXcUUGwEQtFO2UHyDndFS3Al5KAAAAtGYJMNGUOcAKAIwt7851cRxyjcZlw9Rq3IZSnUaxxmo0HpOvz8bLdtXQ6KIxyh0Mea9C3t2Q/yPkHyz93QAAPst5AzVzT80=",
        "eNrt1rERwyAQRUG36HLcjlukABzIAbKPSAcDmt1cehHwSwEAAGA1rwkeLOU5wRsgVAMaGhpbNo6Pv+ui/VVyo9kwoxqnoTSm8bPGRjT+Jt+ejWC7aqzYSHSXRvd87Nbo3Vepjc69m9uI34/kRvgOpjfGTgMA4LJaP+5s4R0="
    ]

    # Load random map chunk
    i = random.randint(0, len(map_chunk_samples) - 1)
    chunk = map_chunk_samples[i]

    # Initialize chunk index
    if not chunk_index:
        chunk_index = random.randint(0, CHUNK_ROWS * CHUNK_COLS)

    payload = {
        "msg_id": str(uuid.uuid4()),
        "clock": networking.incrementClock(),
        "chunk": chunk,
        "chunk_index": chunk_index,
        "robot_id": ROBOT_ID
    }

    return json.dumps(payload)


def receive_chunk(mqttc, obj, msg):
    # This method is a callback for incoming MQTT messages

    try:
        # Parse message and update clock
        json_msg = json.loads(msg.payload)
        if msg.topic == NEW_CHUNK_TOPIC:
            clock = json_msg["clock"]
            networking.updateClock(clock)

    except Exception as e:
        # Ignore objects that cannot be parsed
        logging.warning("Chunk could not be deserialized: {raw_chunk}".format(raw_chunk=msg.payload))


if __name__ == "__main__":
    logging.info("Load Tester v0.1")

    # Wait for a random time to decrease start up load
    t = random.randint(0, 15)
    logging.info("Waiting for {}s".format(t))
    sleep(t)

    # Setup MQTT client
    mqtt_client = networking.MQTTPubSubManager({
        "hostname": MQTT_BROKER,
        "port": MQTT_PORT
    })

    mqtt_client.subscribe(NEW_CHUNK_TOPIC, receive_chunk)

    # Simulate initial map up- or download
    m = None
    try:
        m = networking.get_meta()
        networking.updateClock(m["clock"])

        networking.get_chunks_bulk(CHUNK_ROWS * CHUNK_COLS)

    except Exception as e:
        logging.debug("post meta.json file")
        # Sample meta file for testing purposes
        m = {'width': 4000, 'height': 4000, 'comment': '# Load test', 'max_brightness': 255, "CHUNK_WIDTH": 100,
             "CHUNK_HEIGHT": 100, "CHUNK_ROWS": CHUNK_ROWS, "CHUNK_COLS": CHUNK_COLS,
             "chunk_resource_path": "/api/chunk-service/chunks/id/"}
        networking.post_meta(m)

        # Uploade a map chunk for each possible chunk_index
        for i in range(CHUNK_COLS * CHUNK_ROWS):
            payload = generate_random_chunk_payload(chunk_index=i)
            logging.debug(payload)
            mqtt_client.publish(CREATE_CHUNK_TOPIC, payload)

    # Run MQTT load testing
    while True:
        payload = generate_random_chunk_payload()
        logging.debug(payload)
        mqtt_client.publish(CREATE_CHUNK_TOPIC, payload)
        sleep(1 / UPDATE_FREQUENCY)
