#!/usr/bin/env python2.7
import json
import time

import paho.mqtt.client as mqtt
import rospy
import yaml
from nav_msgs.msg import Odometry

"""
This script takes odometry messages from ROS and bridges them to an MQTT broker.
"""

TOPIC_PREFIX = "ros"
ODOMETRY_TOPIC = "/base_odometry/odom"
ODOMETRY_LAST_UPDATE = time.time()
ODOMETRY_UPDATE_INTERVAL = 0.5  # Seconds


def odometry_callback(data):
    global ODOMETRY_LAST_UPDATE
    current_time = time.time()
    # Limit the output to reduce unnecessary flooding of the broker
    if current_time > ODOMETRY_LAST_UPDATE + ODOMETRY_UPDATE_INTERVAL:
        # FIXME: There are more reliable options for json conversion around. Take a look at rosbridge-library.
        payload = json.dumps(yaml.load(data.__str__()))
        topic = TOPIC_PREFIX + ODOMETRY_TOPIC
        mqtt_client.publish(topic, payload)
        ODOMETRY_LAST_UPDATE = time.time()


def run():
    rospy.init_node('ros_mqtt_bridge')
    rospy.Subscriber(ODOMETRY_TOPIC, Odometry, odometry_callback)
    rospy.spin()


if __name__ == "__main__":
    HOST = "test.mosquitto.org"
    PORT = 1883
    mqtt_client = mqtt.Client()
    print("connect")
    mqtt_client.connect(HOST, PORT, 60)
    run()
