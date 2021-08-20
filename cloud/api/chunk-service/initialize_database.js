const maxConnections = 20;  // maximum number of parallel connections to the cloud
const apiUri = 'http://localhost:8081/api/chunk-service';
const folderPath = './data';

const request = require('request-promise');
const fs = require('fs');
const meta = require(folderPath + '/meta.json');
const _cliProgress = require('cli-progress');


// create a new progress bar instance and use shades_classic theme
const bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);

let tasks = [];
let completed = 0;

async function mainOperation(){
    // save meta
    await request({
        method: 'POST',
        uri: apiUri + '/meta',
        body: meta,
        json: true // Automatically stringifies the body to JSON
    });

    // read files
    let fileNames = await readDir(folderPath);

    console.log('upload files:');
    // start the progress bar with a total value of 200 and start value of 0
    bar1.start(fileNames.length, 0);
    
    for(let index = 0; index < fileNames.length; index++){
        tasks.push({path: folderPath + '/' + fileNames[index], index: index});
    }

    // upload files
    let uploadAgents = [];
    for(let index = 0; index < maxConnections; index++){
        uploadAgents.push(uploadAgent());
    }
    await Promise.all(uploadAgents);
    // stop the progress bar
    bar1.stop();
    console.log('done');
}

async function uploadAgent(){
    while(tasks.length > 0) {
        let task = tasks.pop();
        await uploadFile(task.path, task.index);
        await waitTimeout(1);
        bar1.update(++completed);
    }
}

mainOperation().catch(console.error);

/**
 * Reads file from path and returns buffer
 * @param {string} path path to the compressed pgm chunk file
 * @returns {Buffer} binary data buffer
 */
async function loadFile(path){
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });  
}

/**
 * Loads a file from path and uploads it to the chunk-service
 * @param {string} path to the file
 * @param {number} index number at the end of 'out-*'
 * @returns {object} rest response body 
 */
async function uploadFile(path, index){
    let row = Math.floor(index / (meta.CHUNK_COLS));
    let column = index % (meta.CHUNK_COLS);

    let chunk = await loadFile(path);
    //chunk = await compress(chunk);
    
    let error = true;
    while(error) {
        try {
            let data = {
                'pgmB64compressedData': chunk.toString('base64'),
                'row': row,
                'column': column,
                'timestamp': new Date().toISOString(),
                'robotId': 'init'
            };
            let body = await request({
                method: 'POST',
                uri: apiUri + '/chunks',
                body: data,
                json: true // Automatically stringifies the body to JSON
            });
            return body;
        } catch (e) {
            if(e.name === 'RequestError' || e.name === 'StatusCodeError') {
                error = e;
                console.error('Retry.');
            } else {
                console.error(e);
                error = null;
            }
            
        }
        await waitTimeout(1000);
    }
    
    return null;
}

async function waitTimeout(timeout){
    return new Promise((resolve, reject)=>{
        setTimeout(resolve, timeout);
    });
} 


/**
 * Reads the directory in path and returns an array with the filenames of the form 'out-*'
 * @param {string} path to the directory with the meta.json and the compressed png chunk files
 * @returns {Array<string>} array with the filenames of the form 'out-*'
 */
async function readDir(path){
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, content) => {
            if(err)
                reject(err);
            let result = content.filter(name => (name.indexOf('out-') > -1));
            // sort '10' after '9' instead of '10' after '1'
            let collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
            result.sort(collator.compare);
            resolve(result);
        });
    });  
}






