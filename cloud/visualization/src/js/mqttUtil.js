// const config = require('./config')

const mqtt = require('mqtt')
const events = require('events')
const emitter = new events.EventEmitter()
const config = require('./config.js')
const mqttClient = mqtt.connect(config.MQTT_URL)

mqttClient.on('connect', function () {
  // map updates advertised, grab from elasticsearch
  mqttClient.subscribe('iot/chunks/advertisement', function (err) {
    if (!err) {
      console.log('connected to chunk mqtt with status 0')
    }
  })
  // robot updates directly come from the robots
  mqttClient.subscribe('iot/coordinates/#', function (err) {
    if (!err) {
      console.log('connected to coordinates mqtt with status 0')
    }
  })
})

mqttClient.on('message', function (topic, message) {
  let msgObj = {}
  try {
    // API only accepts json encoded messages
    msgObj = JSON.parse(message.toString())
  } catch (e) {
    // TODO: proper error handling
    console.log(e)
    return
  }
  if (topic === 'iot/chunks/advertisement') {
    emitter.emit('chunk-live-update', msgObj)
  } else if (topic.indexOf('iot/coordinates') > -1) {
    emitter.emit('robot-live-update', msgObj)
  }
})

export const mqttUtil = emitter
