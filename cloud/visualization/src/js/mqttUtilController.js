// const config = require('./config')

const mqtt = require('mqtt')
const events = require('events')
const EventEmitter = events.EventEmitter
const config = require('./config.js')
const mqttClient = mqtt.connect(config.MQTT_URL)

class Client extends EventEmitter {
  constructor () {
    super()
    mqttClient.on('connect', () => {
      this.connected = true
    })
  }

  emitCoordinate (robotId, x, y, orientation) {
    let quaternion
    switch (orientation) {
      case 'up':
        quaternion = { w: -0.707, x: 0, y: 0, z: 0.707 }
        break
      case 'right':
        quaternion = { w: 1, x: 0, y: 0, z: 0 }
        break
      case 'left':
        quaternion = { w: 0, x: 0, y: 0, z: 1 }
        break
      case 'down':
        quaternion = { w: 0.707, x: 0, y: 0, z: 0.707 }
        break
      default:
      quaternion = { w: 1, x: 0, y: 0, z: 0 }
    }
    const message = {
      'robotId': robotId,
      'timestamp': new Date().toISOString(),
      'pose': {
        'position': {
          'x': x,
          'y': y,
          'z': 0
        },
        'orientation': quaternion
      },
      'status': {
        'battery': {
          'battery_level': 3,
          'charging': 'sdf'
        },
        'loaded': 'dfs'
      }
    }

    mqttClient.publish(`iot/coordinates/${robotId}`, JSON.stringify(message))
  }

  emitChunk (robotId, x, y, color) {
    let chunk
    switch (color) {
      case 'black':
        chunk = 'eNrtwQEJAAAAAqD+n64dgZoAAAAAAAAAAADAvw4oEAEA'
        break
      case 'grey':
        chunk = 'eNrtwQEJAAAAAqD/f/pXOwI1AQAAAAAAAAAAgH8d58d51Q=='
        break
      case 'white':
        chunk = 'eNrtwQENAAAAwqD+qW8PBxQAAAAAAAAAAAAcGKJc7Co='
        break
      default:
        chunk = 'eNrtwQEJAAAAAqD/f/pXOwI1AQAAAAAAAAAAgH8d58d51Q=='
    }
    const message = {
      'pgmB64compressedData': chunk,
      'row': Math.floor(y / 100),
      'column': Math.floor(x / 100),
      'timestamp': new Date().toISOString(),
      'robotId': robotId
    }

    mqttClient.publish(`iot/chunks/create`, JSON.stringify(message))
  }

  // iot/chunks/create

  // black chunk:
  // eNrtwQEJAAAAAqD+n64dgZoAAAAAAAAAAADAvw4oEAEA

  // grey chunk
  // eNrtwQEJAAAAAqD/f/pXOwI1AQAAAAAAAAAAgH8d58d51Q==

  // white chunk
  // eNrtwQENAAAAwqD+qW8PBxQAAAAAAAAAAAAcGKJc7Co=

  /* {
  "pgmB64compressedData": "eNrt1rERwyAQRUG36HLcjlukABzIAbKPSAcDmt1cehHwSwEAAGA1rwkeLOU5wRsgVAMaGhpbNo6Pv+ui/VVyo9kwoxqnoTSm8bPGRjT+Jt+ejWC7aqzYSHSXRvd87Nbo3Vepjc69m9uI34/kRvgOpjfGTgMA4LJaP+5s4R0=",
  "row": 3,
  "column": 2,
  "timestamp": "2018-12-20T23:34:33",
  "robotId": "lkjlkj"
}
*/
}

const singleInstance = new Client()

export const mqttUtil = singleInstance
