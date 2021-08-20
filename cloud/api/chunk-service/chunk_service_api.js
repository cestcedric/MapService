const uuidv4 = require('uuid/v4');
const esChunkService = require('./chunk_es_client');
const config = require('common-api-files').config;

// Define topic constants
const SHARE_PREFIX = config.SHARE_PREFIX;
const CREATE_CHUNK_TOPIC = config.CREATE_CHUNK_TOPIC;
const PUBLISH_CHUNK_TOPIC = config.PUBLISH_CHUNK_TOPIC;
const NEW_CHUNK_ADVERTISEMENT_TOPIC = config.NEW_CHUNK_ADVERTISEMENT_TOPIC;
const CLOCK_TOPIC = config.CLOCK_TOPIC;

// MQTT Initialization
let mqttClient = require('common-api-files').mqttClient;
mqttClient.on('connect', () => {
    // Subscribe to relevant topics
    mqttClient.subscribe(SHARE_PREFIX + CREATE_CHUNK_TOPIC);

    // Set callbacks for subscribed topics
    mqttClient.topicMatchingMap.set(CREATE_CHUNK_TOPIC, createChunkMQTT);
    mqttClient.topicMatchingMap.set(CLOCK_TOPIC, esChunkService.networkClockUpdate);
});


// Initialize express app for REST API
let app = require('common-api-files').app;
app.get('/chunks/id/:id/png', getPngById);
app.get('/chunks/id/:id', getChunkById);
app.get('/chunks', getChunks);
app.delete('/chunks', deleteIndex);
app.post('/chunks', createChunkREST);
app.get('/meta', esChunkService.readMeta);
app.post('/meta', esChunkService.createMeta);
app.put('/meta', esChunkService.createMeta);
app.delete('/meta', esChunkService.deleteMeta);


// MQTT Methods
async function createChunkMQTT(message){
    let esresult;
    try {
        esresult = await esChunkService.saveChunk(message);
        advertiseNewChunk(message, esresult); 
    } catch (e){
        console.error(e); // TODO: name errors
    }   
}

function advertiseNewChunk(message, esresult){
    // Advertise new chunk
    mqttClient.publish(NEW_CHUNK_ADVERTISEMENT_TOPIC, JSON.stringify({
        'row': message.row,
        'column': message.column,
        'timestamp': message.timestamp,
        'id': esresult._id,
        'robotId': message.robotId,
        'chunk': message.pgmB64compressedData,
        'png': esresult.pngB64,
        'chunkUrl': '/api/chunk-service/chunks/id/' + esresult._id,
        'pngUrl': '/api/chunk-service/chunks/id/' + esresult._id + '/png',
    }));        
}

// REST Methods
async function createChunkREST(req, res){
    try {
        let body = req.body;
        //console.log(JSON.stringify(body));
        let esresult = await esChunkService.saveChunk(body);
        res.json(esresult);
        advertiseNewChunk(body, esresult);
    } catch (err) {
        console.log(err);
        res.status(err.status || 409);
        res.json({error: err.message || err});
    } 
}

async function getChunkById(req, res){
    try {
        let esResult = await esChunkService.getChunkById(req.params.id);
        res.json(transformChunk(esResult, req.query.reduced, req.query.type));
    } catch (err) {
        console.log(err);
        //res.status(err.status);
        res.status(err.status || 409);
        res.json({error: err.message || err});
    }

}

async function deleteIndex(req, res){
    try {
        let result = await esChunkService.dropIndex();
        res.json(result);
    } catch(err) {
        res.json (err);
    }
}

/**
 * Transforms the esresult into our format.
 * @param {esresult} esHit 
 * @param {boolean} reduced determins if the pgm B64 compressed chunk data will be included in the chunk
 * @param {string} type determins if the chunk will be returned as pgm B64 compressed or png
 * @returns {object} chunk formatted like described in the README
 */
function transformChunk(esHit, reduced, type){
    let chunk = esHit._source;

    let response = {
        'row': chunk.row,
        'column': chunk.column,
        'timestamp': chunk.timestamp,
        'id': esHit._id,
        'robotId': chunk.robotId
    };

    if(typeof reduced === 'string')
        reduced = (reduced.toLowerCase() === 'true');

    if(!reduced){
        if(type === 'png'){
            response['chunk'] = chunk.pngB64;
            response['type'] = 'png_base64';
        } else {
            response['chunk'] = chunk.pgmB64compressed;
            response['type'] = 'pgm_base64_compressed';
        }
    }       

    return response;
}

async function getPngById(req, res){
    try {
        let esResult = await esChunkService.getChunkById(req.params.id);
        let chunk = esResult._source;
        let png = Buffer.from(chunk.pngB64, 'base64');
        res.contentType('image/png');
        res.write(png);
        res.end();
    } catch (err) {
        console.log(err);
        res.status(err.status || 409);
        res.json({error: err.message || err});
    }
}

/**
 * Handles the [GET] chunks request. Allows for query parameters as described in the README.
 * @param {*} req 
 * @param {*} res 
 */
async function getChunks(req, res) {
    try {
        let esResult = await esChunkService.getChunks(req.query);
        let hits = esResult.hits.hits;
        let results = [];

        hits.forEach((hit)=>{
            results.push(transformChunk(hit, req.query.reduced, req.query.type));
        });
        res.json(results);                
    } catch (err) {
        if(JSON.stringify(err).indexOf('index_not_found_exception') > -1)
            return res.json([]);
        console.log(err);
        res.status(err.status || 409);
        res.json({error: err.message || err});
    }
}
