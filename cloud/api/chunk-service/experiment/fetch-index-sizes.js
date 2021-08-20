const interval = 20;  // maximum number of parallel connections to the cloud
const apiUri = 'http://34.73.42.89:9200';
const append = require('./append.js');

const request = require('request-promise');
const fs = require('fs');


async function fetchData(){
    let data = await request({
        method: 'GET',
        uri: apiUri + '/*/_stats/store',
        json: true // Automatically stringifies the body to JSON
    });
    return data;
}

async function saveData(){
    let data = await fetchData();
    // date
    let string = new Date().toISOString() + ',';
    // shards
    string += data._shards.total + ',';
    string += data._shards.successful + ',';
    string += data._shards.failed + ',';
    // total-store
    string += data._all.total.store.size_in_bytes + ',';
    // chunk-latest
    string += data.indices['chunks-latest'].total.store.size_in_bytes + ',';
    // chunks
    string += data.indices['chunks'].total.store.size_in_bytes + ',';
    // coordinates-latest
    string += data.indices['coordinates-latest'].total.store.size_in_bytes + ',';
    // coordinates
    string += data.indices['coordinates'].total.store.size_in_bytes + ',';
    // meta
    string += data.indices['meta'].total.store.size_in_bytes + '\n';
    
    await append(string);
}

saveData().catch(console.error);
setInterval(() => {
    saveData().catch(console.error);
}, 5 * 60000);