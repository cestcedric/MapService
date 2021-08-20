let mqtt = require('mqtt');
let mqttBroker = process.env.MQTT || 'test.mosquitto.org';
let mqttClient = mqtt.connect('mqtt://' + mqttBroker);
mqttClient.topicMatchingMap = new Map();
mqttClient.on('message', function (topic, message) {
    let msgObj = {};
    try {
        // API only accepts json encoded messages
        msgObj = JSON.parse(message.toString());
    } catch (e) {
        // TODO: proper error handling
        console.log(e);
        return
    }

    mqttClient.topicMatchingMap.forEach((callback, topicKey) => {
        // FIXME: This might cause trouble with more complicated wildcard patterns
        if (topic.startsWith(topicKey.replace('#', ''))) {
            callback(msgObj)
        }
    });
});

module.exports = mqttClient;