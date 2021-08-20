# run this with python3

import os
import sys
import math
import json
import time
import numpy
import random
import logging
import tkinter as tk
import paho.mqtt.client as mqtt
from datetime import datetime
from PIL import ImageTk, Image
from pyquaternion import Quaternion
from simulation.map_simulator import Map_Simulator


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

def read_meta(file):
    # Wait for meta.json file to be ready and read required values

    while not os.path.exists(file):
        time.sleep(1)

    with open(file, 'r') as meta:
        m = json.loads(meta.read())
        return m


mqtt_topic = 'iot/coordinates/{id}'.format(id=ROBOT_ID)
# version sometimes needed, depending on installation
mqtt_client = mqtt.Client("", True, None, mqtt.MQTTv31) 
mqtt_client.on_connect = on_connect

mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
mqtt_client.loop_start()

counter = 1

timestep = 1
last_update = time.time()

pos_x = 10
pos_y = 150
ori_x = 1
ori_y = 0
ori_angle = 0
timestamp = datetime.utcnow()
battery_level = 0.81
battery_charging = False
load_status = True

root = tk.Tk()
root.title('Robot Simulation')

# docker
# map_path = '/usr/src/app/map/map.pgm'
# meta_path = '/usr/src/app/map/meta.json'

# local
# os.chdir('..')
# map_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'map/map.pgm'))
# meta_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'map/meta.json'))
map_path = '/home/cedric/Desktop/IoT/robot/src/chunk_manager/map/map.pgm'
meta_path = '/home/cedric/Desktop/IoT/robot/src/chunk_manager/map/meta.json'

size = Image.open(map_path).size
img = ImageTk.PhotoImage(Image.open(map_path))

canvas = tk.Canvas(root, width = size[0], height = size[1])
canvas.pack(side="bottom", fill="both", expand="yes")
canvas.map = canvas.create_image(0, 0, anchor='nw', image=img)
canvas.image = img
canvas.robot = canvas.create_oval(pos_x, pos_y, 35, 175, outline="#f00", fill="#f00", width=2)


def send_update():
    global pos_x
    global pos_y
    global ori_x
    global ori_y
    global ori_angle
    global timestamp
    global ROBOT_ID
    global battery_level
    global battery_charging
    global load_status
    global last_update
    global timestep

    global mqtt_topic
    global mqtt_client

    global map_path
    global meta_path

    if last_update + timestep < time.time():
        timestamp = datetime.utcnow()
        orientation = Quaternion(axis=[0,0,1], angle=ori_angle)
        print(orientation)
        jsonmsg = json.dumps({
                "robotId" : ROBOT_ID,
                "timestamp" : str(timestamp.isoformat()),
                "pose" : {
                    "position" : {
                        "x" : pos_x,
                        "y" : pos_y,
                        "z" : 0
                    },
                    "orientation" : {
                        "x" : orientation[1],
                        "y" : orientation[2],
                        "z" : orientation[3],
                        "w" : orientation[0]
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

        mqtt_client.publish(mqtt_topic, jsonmsg)
        last_update = time.time()

        if battery_charging:
            battery_level = battery_level + 0.01
            if battery_level > 0.9:
                battery_charging = False
        else:
            battery_level = battery_level - 0.0005
            if battery_level < 0.1:
                battery_charging = True

        # randomly update map
        rnd = random.randint(0, 100)
        if rnd < 20:
        	m = read_meta(meta_path)
        	sim_map = Map_Simulator(m)
        	sim_map.step(pos_x + ori_x*50, pos_y + ori_y*50)


def leftKey(event):
    global pos_x
    global pos_y
    global ori_x
    global ori_y
    global ori_angle
    global map_path
    
    img1 = ImageTk.PhotoImage(Image.open(map_path))
    canvas.itemconfig(canvas.map, image = img1)
    canvas.image = img1
    canvas.move(canvas.robot, -10, 0)
    pos_x = pos_x - 10
    ori_x = -1
    ori_y = 0
    ori_angle = math.pi

    send_update()

def rightKey(event):
    global pos_x
    global pos_y
    global ori_x
    global ori_y
    global ori_angle
    global map_path

    img2 = ImageTk.PhotoImage(Image.open(map_path))
    canvas.itemconfig(canvas.map, image = img2)
    canvas.image = img2
    canvas.move(canvas.robot, 10, 0)
    pos_x = pos_x + 10
    ori_x = 1
    ori_y = 0
    ori_angle = 0

    send_update()

def upKey(event):
    global pos_x
    global pos_y
    global ori_x
    global ori_y
    global ori_angle
    global map_path

    img3 = ImageTk.PhotoImage(Image.open(map_path))
    canvas.itemconfig(canvas.map, image = img3)
    canvas.image = img3
    canvas.move(canvas.robot, 0, -10)
    pos_y = pos_y - 10
    ori_x = 0
    ori_y = -1
    ori_angle = math.pi*1.5

    send_update()

def downKey(event):
    global pos_x
    global pos_y
    global ori_x
    global ori_y
    global ori_angle
    global map_path

    img4 = ImageTk.PhotoImage(Image.open(map_path))
    canvas.itemconfig(canvas.map, image = img4)
    canvas.image = img4
    canvas.move(canvas.robot, 0, 10)
    pos_y = pos_y + 10
    ori_x = 0
    ori_y = 1
    ori_angle = math.pi/2

    send_update()


root.bind('<Left>', leftKey)
root.bind('<Right>', rightKey)
root.bind('<Up>', upKey)
root.bind('<Down>', downKey)
root.mainloop()
