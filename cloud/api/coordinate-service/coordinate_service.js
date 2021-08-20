const config = require('common-api-files').config;
const esClient = require('./coordinate_es_client');

// Define topic constants
const SHARE_PREFIX = config.SHARE_PREFIX;
const COORDINATE_TOPIC = config.COORDINATE_TOPIC;
const PUBLISH_COORDINATE_TOPIC = config.PUBLISH_COORDINATE_TOPIC;

// MQTT Initialization
let mqttClient = require('common-api-files').mqttClient;
mqttClient.on('connect', () => {
    console.log('coordinate service connected to mqtt broker');
    // Subscribe to relevant topics
    mqttClient.subscribe(COORDINATE_TOPIC);

    // Set callbacks for subscribed topics
    mqttClient.topicMatchingMap.set(COORDINATE_TOPIC, createCoordinate);
});


async function createCoordinate(robotInfo) {
    if(robotInfo.robot_id)
        robotInfo.robotId = robotInfo.robot_id;
    //console.log(JSON.stringify(robotInfo));

    let id = robotInfo.robotId;

    esClient.saveCoordinate(robotInfo);

    // Publish to frontend topic
    mqttClient.publish(PUBLISH_COORDINATE_TOPIC + '/' + id, JSON.stringify(robotInfo));
}

// Initialize express app for REST API
let app = require('common-api-files').app;
app.get('/robots', getRobotInfo);
app.post('/robots', postRobotInfo);

/**
 * Handles the [GET] /robots request. Allows for query parameters as described in the README.
 * @param {*} req 
 * @param {*} res 
 */
async function getRobotInfo(req, res) {
    try {
        let results = await esClient.getCoordinate(req.query);   
        res.json(results);           
    } catch (err) {
        if(JSON.stringify(err).indexOf('index_not_found_exception') > -1)
            return res.json([]);
        console.log(err);
        res.status(err.status || 409);
        res.json(err);
    }
}

/**
 * Handles the [POST] /robots request. Allows for query parameters as described in the README.
 * @param {*} req 
 * @param {*} res 
 */
async function postRobotInfo(req, res) {
    try {
        let result = await esClient.saveCoordinate(req.body);
        res.json(result);           
    } catch (err) {
        console.log(err);
        res.status(err.status || 409);
        res.json({error: err.message || err});
    }
}
