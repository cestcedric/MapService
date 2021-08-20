import json
import math
import numpy
from math import cos, sin, radians
from random import randint
from datetime import datetime
from pyquaternion import Quaternion

class Coordinate_Simulator():
    def __init__(self, x=0, y=0, m=None, map=None):
        self.x = 0
        self.y = 0
        self.m = m
        self.map = map

    def step(self):
        raise NotImplementedError


class Circle_Walk_Simulator(Coordinate_Simulator):
    radius = randint(250, 550)
    angle = 0
    def __init__(self, x=0, y=0, m=None, map=None):
        super().__init__(x, y, m, map)
        self.origin_x = x
        self.origin_y = y
        self.m = m

    def step(self):
        x, y = self.circle_step()

        # Make sure the robot cannot leave the map
        if x < 0:
            x = 0
        if x > self.m["width"]:
            x = self.m["width"]
        if y < 0:
            y = 0
        if y > self.m["height"]:
            y = self.m["height"]

        # Update local coordinates
        self.x = x
        self.y = y
        return (self.x, self.y)

    def circle_step(self):
        x = self.origin_x + self.radius * cos(radians(self.angle))
        y = self.origin_y + self.radius * sin(radians(self.angle))

        # Update alpha; step size is length of circle
        self.angle += 5
        return (x, y)

    def prepare_coordinate_payload(self, x, y, robot_id):
        timestamp = datetime.utcnow()
        orientation = Quaternion(axis=[0,0,1], angle=(radians(self.angle)+math.pi/2))
        return json.dumps({
                "robotId" : robot_id,
                "timestamp" : str(timestamp.isoformat()),
                "pose" : {
                    "position" : {
                        "x" : x,
                        "y" : y,
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
                        "battery_level" : (100 - timestamp.minute),
                        "charging" : str(False)
                    },
                    "loaded" : str(True)
                }
            })
