import base64
import json
import logging
import os
import sys
import uuid
import zlib
import socket
from datetime import datetime
import time

import paho.mqtt.client as mqtt
import requests

#api_host = socket.gethostbyname('nginx')
try:
    API_HOST = os.environ["API_HOST"]#api_host#os.environ["API_HOST"]
    API_PORT = os.environ["API_PORT"]
except KeyError as e:
    logging.error(e)
    sys.exit(-1)


class PubSubManager():
    """ Abstract class that provides an interface for a generic publisher/subscriber solution. """

    # TODO: introduce connect / disconnect methods?
    def __init__(self, configuration):
        pass  # TODO: this should raise an appropriate error

    def publish(self, topic, payload):
        raise NotImplementedError

    def subscribe(self, topic, callback=None):
        # TODO: check compliance with Liskovs substitution principle
        raise NotImplementedError


class MQTTPubSubManager(PubSubManager):     
    def __init__(self, configuration):
        # TODO: declutter this constructor
        super().__init__(configuration)
        self.callbacks = []
        self.callbacks.append(lambda mqttc, obj, msg: logging.debug(
            "{topic} : {payload} ...".format(topic=msg.topic, payload=msg.payload[:25])))

        host = configuration["hostname"]
        port = configuration["port"]

        mqtt.Client.connected_flag = False
        self.client = mqtt.Client()

        i=0
        
        self.client.loop_start()
        logging.info("Connecting to broker.")
        try:
            self.client.connect(host, port, 60)
        except Exception as e:
            logging.info("Waiting for connection.")
        self.client.on_connect = on_connect
        while not self.client.connected_flag:
            time.sleep(1)
            i=i+1
        logging.info("Connected")
        self.client.loop_stop()

        self.client.on_message = lambda mqttc, obj, msg:[callback(mqttc, obj, msg) for callback in
                                                    self.callbacks]
        self.client.on_disconnect = on_disconnect 
        self.client.loop_start()

    def publish(self, topic, payload):
        self.client.publish(topic, payload)

    def subscribe(self, topic, callback=None):
        logging.info("mqtt subscribe new chunks ")
        if callback:
            self.callbacks.append(callback)
        self.client.subscribe(topic)
        pass

def on_connect(mqttc, obj, flags, rc):
    logging.info("rc:{}".format(rc))
    if rc==0:
        logging.debug("mqtt connection successful")
        mqttc.connected_flag = True
    else:
        logging.info("mqtt connection failed")

def on_disconnect(client, userdata, rc):
    logging.info("disconnecting reason  "  +str(rc))
    client.connected_flag=False
    client.disconnect_flag=True

def encode(chunk):
    """ Returns an encoded string representation of a given chunk. """
    return base64.standard_b64encode(chunk).decode("utf-8")


def decode(chunk):
    """ Returns a decoded binary representation of a given chunk. """
    return base64.standard_b64decode(chunk)


def get_chunks_bulk(amount_of_chunks):
    try:
    	response = requests.get('http://{url}:{port}/api/chunk-service/chunks?limit={limit}&latest=True'.format(url=API_HOST, port=API_PORT,limit=amount_of_chunks))
    	response.raise_for_status()
    except requests.exceptions.HTTPError as err:
    	logging.info(err)
    except requests.exceptions.Timeout as err:
    	logging.info(err)
    except requests.exceptions.TooManyRedirects as err:
    	logging.info(err)
    except requests.exceptions.RequestException as err:
    	logging.info(err)

    # Parse all chunks
    chunk_list = []
    for nc in response.json():
        network_chunk_string = nc["chunk"]
        #logging.info(network_chunk_string)
        chunk = parse_network_chunk(network_chunk_string)
        chunk_list.append({"chunk":chunk,"row":nc["row"],"column":nc["column"]})

    return chunk_list

def get_chunk(chunk_url):
    try:
        url = "http://"+API_HOST+":"+API_PORT+chunk_url
        response = requests.get(url)
        #logging.info(response.json()["chunk"])
        response.raise_for_status()
    except requests.exceptions.HTTPError as err:
        logging.info(err)
    except requests.exceptions.Timeout as err:
        logging.info(err)
    except requests.exceptions.TooManyRedirects as err:
        logging.info(err)
    except requests.exceptions.RequestException as err:
        logging.info(err)
    except Exception as e:
        logging.info(e)
    return response.json()["chunk"]


def get_meta(): 
    try:
        response = requests.get('http://{url}:{port}/api/chunk-service/meta'.format(url=API_HOST, port=API_PORT))
        response.raise_for_status()
    except requests.exceptions.HTTPError as err:
        logging.info(err)
    except requests.exceptions.Timeout as err:
        logging.info(err)
    except requests.exceptions.TooManyRedirects as err:
        logging.info(err)
    except requests.exceptions.RequestException as err:
        logging.info(err)
    return response.json()


def parse_network_chunk(network_chunk_string):
    chunk_decoded = decode(network_chunk_string)
    chunk_decompressed = zlib.decompress(chunk_decoded)
    return chunk_decompressed


def post_meta(m):
    try:
        response = requests.post('http://{url}:{port}/api/chunk-service/meta'.format(url=API_HOST, port=API_PORT), json=m)
        response.raise_for_status()
    except requests.exceptions.HTTPError as err:
        logging.info(err)
    except requests.exceptions.Timeout as err:
        logging.info(err)
    except requests.exceptions.TooManyRedirects as err:
        logging.info(err)
    except requests.exceptions.RequestException as err:
        logging.info(err)


ROBOT_ID = os.environ["HOSTNAME"]


def prepare_payload(chunk, row, column):
    timestamp = datetime.utcnow().isoformat()
    payload = {
        "pgmB64compressedData": encode(chunk),
        "row": row,
        "column": column,
        "timestamp": timestamp,
        "robotId": ROBOT_ID
    }

    return json.dumps(payload)
