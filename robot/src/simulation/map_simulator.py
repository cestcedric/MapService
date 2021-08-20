import logging
import random
import subprocess
import os 

# # TODO: Do not hardcode the map location but load it as an environment variable
docker_path = os.getcwd()
devnull = open(os.devnull, 'w')
PNM_PASTE_BIN = docker_path+"/src/simulation/modifyMap.sh"
MAP = docker_path+"/src/chunk_manager/map/map.pgm"
OBSTACLE = docker_path+"/src/simulation/res/obstacle.pgm"
CLEAR = docker_path+"/src/simulation/res/clear.pgm"
OBSTACLE_SIZE = 25

# local values
# MAP = '/home/cedric/Desktop/IoT/robot/map/map.pgm'
# OBSTACLE = '/home/cedric/Desktop/IoT/robot/src/simulation/res/obstacle.pgm'
# CLEAR = '/home/cedric/Desktop/IoT/robot/src/simulation/res/clear.pgm'
# PNM_PASTE_BIN = '/home/cedric/Desktop/IoT/robot/src/simulation/modifyMap.sh'
# OBSTACLE_SIZE = 25


class Map_Simulator():
    def __init__(self, m):
        self.m = m

    def step(self, x, y):
        # Adjust coordinates to allowed range
        if x > self.m["width"] - OBSTACLE_SIZE:
            x = self.m["width"] - OBSTACLE_SIZE
        if x < OBSTACLE_SIZE:
            x = OBSTACLE_SIZE
        if y > self.m["height"] - OBSTACLE_SIZE:
            y = self.m["height"] - OBSTACLE_SIZE
        if y < OBSTACLE_SIZE:
            y = OBSTACLE_SIZE
        
        # only add obstacles, no removing
        add_obstacle(x, y)


def add_obstacle(x, y):
    logging.info("add obstacle")
    modify_pgm(OBSTACLE, MAP, x, y)


def remove_obstacle(x, y):
    logging.info("remove obstacle")
    modify_pgm(CLEAR, MAP, x, y)


def modify_pgm(input_pgm, output_pgm, x, y):
    # python 3.5
    # return subprocess.run(["bash", PNM_PASTE_BIN, input_pgm, str(x), str(y), output_pgm])
    # python 3.4
    return subprocess.call([PNM_PASTE_BIN, input_pgm, str(x), str(y), output_pgm])#, stdout=devnull, stderr=devnull)
