#! /usr/bin/env python

import rospy
import time
import json
import os
import logging
import sys
import paho.mqtt.client as mqtt

from nav_msgs.msg import Odometry
from datetime import datetime

try:
	ROBOT_ID = os.environ["HOSTNAME"]
	UPDATE_FREQUENCY = float(os.environ["UPDATE_FREQUENCY"])
	MQTT_BROKER = os.environ["MQTT_BROKER"]
	MQTT_PORT = int(os.environ["MQTT_PORT"])
except KeyError as e:
#	logging.error(e)
	ROBOT_ID = 1239862
	MQTT_BROKER = "localhost"
	MQTT_PORT = 1883
	UPDATE_FREQUENCY = 1/10
   


def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))

mqtt_topic = 'iot/coordinates/{id}'.format(id=ROBOT_ID)
mqtt_client = mqtt.Client("", True, None)#, mqtt.MQTTv31) version sometimes needed, depending on installation
mqtt_client.on_connect = on_connect

mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
mqtt_client.loop_start()

timestep = 1 # seconds
last_update = time.time()


def callback(msg):
	global timestep
	global last_update
	global mqtt_topic
	global mqtt_client

	if last_update + timestep < time.time():
		# read this from odometry
		position = msg.pose.pose.position
		orientation = msg.pose.pose.orientation
		# let BMW specify where this comes from
		battery_level = 0.81
		battery_charging = False
		load_status = True
		timestamp = datetime.utcnow()

		last_update = time.time()

		jsonmsg = json.dumps({
			"robotId" : ROBOT_ID,
			"timestamp" : str(timestamp.isoformat()),
			"pose" : {
				"position" : {
					"x" : position.x,
					"y" : position.y,
					"z" : position.z
				},
				"orientation" : {
					"x" : orientation.x,
					"y" : orientation.y,
					"z" : orientation.z,
					"w" : orientation.w
				}
			},
			"status" : {
				"battery" : {
					"battery_level" : battery_level,
					"charging" : str(battery_charging)
				},
				"loaded" : str(load_status)
			}
		})

		if battery_charging:
			battery_level = battery_level + 0.1
			if battery_level > 0.9:
				battery_charging = False
		else:
			battery_level = battery_level - 0.05
			if battery_level < 0.1:
				battery_charging = True

		mqtt_client.publish(mqtt_topic, jsonmsg)




rospy.init_node('rosbridge')
sub = rospy.Subscriber('/odom', Odometry, callback)
rospy.spin()


#####################################################
#													#
#	   To update the internal ROS map, stop the 	#
#	   map server and relaunch it, with the map		#
#				   	  as parameter.					#
#													#
#####################################################