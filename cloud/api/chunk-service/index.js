const uuidv4 = require('uuid/v4');
let app = require('common-api-files').app;
console.log(process.version);

let instanceID = uuidv4();

app.get('/', (req, res) => {
    res.json({'name': 'bmw-iot-chunk-service', 'version': 'v1.0', 'id': instanceID});
});

// Start chunk service
require('./chunk_service_api');