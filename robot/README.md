# Robot
## Usage
The recommended way to use the program is docker-compose. To start
three instances of the robot software simply run

`docker-compose up --build --scale robot=3`

or you can run the program without docker using following command and it starts only one robot.

`sh start_without_docker.sh`

from the repository root. When running inside docker-compose the program
does not destroy the provided map but works on a copy of it. When running
directly under Python (deprecated and unstable) it will modify the provided map file.

In order to launch a visual interactive robot simulator run

`python3 src/interactive_sim.py`

To activate the map synchronization, additionally run the chunk manager.

## main.py arguments
To run robot, Dockerfile simply run docker_entrypoint.sh and we need some arguments to run main.py which are defined below
You can also run robot without docker so simply use 'sh start_without_docker.sh'.
In any case you can change these arguments in that scripts(docker_entrypoint.sh,start_without_docker.sh)
It is Usage of argument is in docker-entrypoint.sh and start_without_docker.sh

- --output-dir = output directory for chunks
- --chunk-height = define chunk height e.g. 100
- --chunk-width = define chunk width e.g. 100
- --file = directory of map
- --meta = directory of meta file
- --debug = boolean value if it is true, debug loggings are visible
- --simulator = boolean value if it is true, it runs simulator

## Configuration
The program needs some environment variables to be set in order to run.
Those can be easily adjusted in the `docker-compose.yml` file or when
run manually just exported as shell environment variables.
- API_HOST: The hostname of the API server, e.g. cloud.lrz.de
- API_PORT: The port of the API server, e.g. 80
- MQTT_BROKER: The hostname of an MQTT broker, e.g. test.mosquitto.org
- MQTT_PORT: The port of the MQTT broker, e.g. 1883
- CHUNK_WIDTH: The width of a single map chunk, e.g. 100
- CHUNK_HEIGHT: The height of a single map chunk, e.g. 100
- UPDATE_FREQUENCY: The amount of coordinate updates per second, e.g. 10. 
When used in load testing mode, this defines the amount of map chunk creations per second.

Furthermore, the map file that is used can be provided as `map/map.pgm`.

## Load Testing
In order to run the load testing simulation you can use 

`docker-compose -f load.yml up --build --scale robot=3` 

to run three independent load testing simulation robots. Those do not actually
produce meaningful map data and are therefore unsuitable to be used in production.
This method is however deprecated and was not tested by us, 
it is a legacy funtion from the first team working on this project.

The new way to run load testing is by using

`python simple_simulator.py`

which takes already pre-sliced chunks and just sends them to another position, without changes.
It also simulates robot movement. This method is especially lightweight and therefore recommended.


## Messaging
The robot first updates the local map by querying for all current chunks using the REST API.
All messaging after the start-up phase is done via MQTT.

### Map updates
The robot sends a message like this:

```json
{
  "pgmB64compressedData": "eNrt1rERwyAQRUG36HLcjlukABzIAbKPSAcDmt1cehHwSwEAAGA1rwkeLOU5wRsgVAMaGhpbNo6Pv+ui/VVyo9kwoxqnoTSm8bPGRjT+Jt+ejWC7aqzYSHSXRvd87Nbo3Vepjc69m9uI34/kRvgOpjfGTgMA4LJaP+5s4R0=",
  "row": 3,
  "column": 2,
  "timestamp": "2018-12-20T23:34:33",
  "robotId": "lkjlkj"
}
```

On other robots' updates the robot receives a chunk update advertisement and integrates the new chunk in the local map.

### Robot information
The robot sends a message like this:
```json
{
  "robotId": "blabla",
  "timestamp": "2018-12-20T23:34:33",
  "pose": {
    "position": {
      "x": 10,
      "y": 20,
      "z": 0
    },
    "orientation": {
      "x": 0,
      "y": 0,
      "z": 0,
      "w": 1
    }
  },
  "status": {
    "battery": {
      "battery_level": 3,
      "charging": "sdf"
    },
    "loaded": "dfs"
  }
}
```

### ROS integration
To get robot information from ROS set up catkin and register the rosbridge.
Make sure the script is executable and run it using

`rosrun rosbridge.py`

The ROS map cannot be modified while the navigation stack is running.
To synchronize the map it has to be exported, then updated using the cloud.
Finally restart the navigation and import the updated map.
