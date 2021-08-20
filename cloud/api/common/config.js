// MQTT TOPICS

module.exports.SHARE_PREFIX = process.env.SHARE_PREFIX || '$share/bmw/';
module.exports.CREATE_CHUNK_TOPIC = process.env.CREATE_CHUNK_TOPIC || 'iot/chunks/create';
module.exports.PUBLISH_CHUNK_TOPIC = process.env.PUBLISH_CHUNK_TOPIC || 'iot/chunks/publish';
module.exports.NEW_CHUNK_ADVERTISEMENT_TOPIC = process.env.NEW_CHUNK_ADVERTISEMENT_TOPIC || 'iot/chunks/advertisement';
module.exports.CLOCK_TOPIC = process.env.CLOCK_TOPIC || 'iot/chunk-service/clock';
module.exports.COORDINATE_TOPIC = process.env.COORDINATE_TOPIC || "iot/coordinates/#";
module.exports.PUBLISH_COORDINATE_TOPIC = process.env.PUBLISH_COORDINATE_TOPIC || "iot/coordinates-frontend";