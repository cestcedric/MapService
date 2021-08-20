let config = {}

try {
  config = require('../../config.json')
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') {
    throw e
  }
  // ignore
}

config.API_URL = process.env.API_URL || config.API_URL || 'http://localhost:8081'
config.MQTT_URL = process.env.MQTT_URL || config.MQTT_URL || 'ws:localhost:9001/mqtt'

module.exports = config
