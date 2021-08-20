const uuidv4 = require('uuid/v4');
let app = require('common-api-files').app;

let instanceID = uuidv4();

app.get('/', (req, res) => {
    res.json({'name': 'bmw-iot-coordinate-service', 'version': 'v0.1', 'id': instanceID});
});

// Start coordinate service
require("./coordinate_service");
