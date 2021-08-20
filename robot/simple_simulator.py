#!/usr/bin/python
import json
import os
import random
import sys
import numpy
import zlib
import base64
import time
from datetime import datetime
import paho.mqtt.client as mqtt

def on_connect(client, userdata, flags, rc):
	print("Connected with result code " + str(rc))

def get_chunk(row, column, robotId):
	chunk_str = ''
	# path to folder where you sliced the map
	with open('/home/robot/map/big_map/out-r'+str(row)+'_c'+str(column), "rb") as file:
		chunk_str = file.read()
		timestamp = datetime.utcnow().isoformat()
		chunk = base64.standard_b64encode(chunk_str).decode("utf-8")
		payload = {
			"pgmB64compressedData": chunk,
			"row": str((row+2)%32),
			"column": str((column+3)%48),
			"timestamp": timestamp,
			"robotId": robotId
		}
	return json.dumps(payload)

def get_robot_info(x, y, robotId):
	payload = {
		"robotId": robotId,
		"timestamp": str(datetime.utcnow().isoformat()),
		"pose":{
			"position":{
				"x": x,
				"y": y,
				"z": 0
			},
			"orientation":{
				"x": 0,
				"y": 0,
				"z": 0,
				"w": 1
			}
		},
		 "status":{
		 	"battery" :{
		 		"battery_level": 17,
		 		"charging": str(False)
		 	},
		 	"loaded": str(True)
		 	}
		}
	return json.dumps(payload)


chunk_topic = 'iot/chunks/create'
coordinate_topic = 'iot/coordinates/'
# address of the cloud, no local MQTT
MQTT_BROKER = '35.185.9.59'
# robots to be simulated
N_robots = 20


mqtt_client = mqtt.Client("", True, None, mqtt.MQTTv31)
mqtt_client.on_connect = on_connect
mqtt_client.connect(MQTT_BROKER, 1883, 60)
mqtt_client.loop_start()

positions = numpy.zeros((N_robots,2)) # fixed orientation, z=0
# initialize positions
for p in range(N_robots):
	x = random.randint(0,4800)
	y = random.randint(0,3200)
	positions[p,0] = x
	positions[p,1] = y

time.sleep(10)

i = 0
while (1):
	for p in range(N_robots):
		step = random.randint(0,4)
		if (step == 0):
			positions[p,0] = (positions[p,0] + 10 )% 4800
			positions[p,1] = (positions[p,1] + 10 )% 3200
		if (step == 1):
			positions[p,0] = (positions[p,0] + 10 )% 4800
			positions[p,1] = (positions[p,1] - 10 )% 3200
		if (step == 2):
			positions[p,0] = (positions[p,0] - 10 )% 4800
			positions[p,1] = (positions[p,1] + 10 )% 3200
		if (step == 3):
			positions[p,0] = (positions[p,0] - 10 )% 4800
			positions[p,1] = (positions[p,1] - 10 )% 3200

		mqtt_client.publish(coordinate_topic + str(p), get_robot_info(positions[p,0], positions[p,1], p))
		print('robot info for: ' + str(p))

		if (i == 4):
			row = random.randint(0,31)
			column = random.randint(0,47)
			mqtt_client.publish(chunk_topic, get_chunk(row,column,p))
			print('chunk update for: ' + str(p))

		i = (i+1)%5
	print('================================')
	print('iteration done: ' + str(datetime.utcnow()))
	print('================================')
	time.sleep(1)