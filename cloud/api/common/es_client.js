let elasticsearch = require('elasticsearch');
let ES_HOST = process.env.ES_HOST || '127.0.0.1';
let ES_PORT = process.env.ES_PORT || '9200';
let esClient = new elasticsearch.Client({
    host: ES_HOST + ':' + ES_PORT,
    log: 'error',
    deadTimeout: 100000,
    maxRetries: 5
});

esClient.createIndexIfNotExists = async (index) => {
    try {
        esClient.indices.exists({'index': index});
    } catch (e) {
        console.log('Try to create index: ' + index);
        esClient.indices.create({
            index: index
        });
    }
};

esClient.waitForConnection = async () => {
    let error = null;
    while(!error){
        error = null;
        try {
            await esClient.ping({requestTimeout: 30000});
        } catch(e) {
            error = e;
            console.log('elasticsearch cluster is down! retry to connect.');
        }
    }  
};

module.exports = esClient;
