// Initialize esClient
const esClient = require('common-api-files').esClient;
const assert = require('assert');
const processChunkFromCompressedBinary = require('./chunk_utils');

const INDEX = process.env.ES_INDEX || 'chunks';
const INDEX_LATEST = INDEX + '-latest';
const TYPE = process.env.ES_TYPE || 'chunk';

/**
 * 
 * @param {object} chunk 
 * @param {number} chunk.row
 * @param {number} chunk.column
 * @param {string} chunk.timestamp
 * @param {string} chunk.pgmB64compressedData
 * @param {string} chunk.robotId
 * @returns {object} esresult
 */
async function saveChunk(chunk) {
    await esClient.createIndexIfNotExists(INDEX);
    await esClient.createIndexIfNotExists(INDEX_LATEST);

    // compare to latest chunk
    try {
        let latestChunk = await getChunks({row: chunk.row, column: chunk.column, latest: true});
        latestChunk = latestChunk.hits.hits[0];
        if(latestChunk){
            assert(latestChunk._source.timestamp <= chunk.timestamp, 'this chunk is outdated');
        }
    } catch (e) {
        // ignore if index is empty
        if(!e.body)
            throw new Error(e);
        if(e.body.status !== 404)
            throw new Error(e);
                
    }
    
    // Process map chunk
    // TODO: determine if this is really necessary
    let pngBuffer = {};
    try {
        pngBuffer = await processChunkFromCompressedBinary(chunk.pgmB64compressedData);
    } catch(e) {
        // FIXME: There seems to be a bug that occurs from time to time where PGM assembly fails.
        // See https://gitlab.lrz.de/iot-bmw/cloud/issues/2
        console.log('fixme');
        console.log(chunk);
        throw e;
    }

    let body = {
        'row': chunk.row,
        'column': chunk.column,
        'timestamp': chunk.timestamp,
        'pngB64': pngBuffer.toString('base64'),
        'pgmB64compressed': chunk.pgmB64compressedData,
        'robotId': chunk.robotId
    };

    // Make chunk persistent
    let esresult = await
    esClient.index({
        index: INDEX,
        type: TYPE,
        id: 'row:'+chunk.row+'_column:'+chunk.column+'_'+chunk.timestamp,
        body: body,
        refresh: 'true'
    });

    // Overwrite latest index for faster search
    await esClient.index({
        index: INDEX_LATEST,
        type: TYPE,
        id: 'row:'+chunk.row+'_column:'+chunk.column+'_latest',
        body: body,
        refresh: 'true'
    });

    esresult.pngB64 = pngBuffer.toString('base64');

    return esresult;
}

async function getIndexHealth(){
    return await esClient.cat.indices({index: INDEX});
}

async function dropIndex(){
    await esClient.indices.delete({index: INDEX_LATEST});
    return esClient.indices.delete({index: INDEX});
}

/**
 * 
 * @param {object} filter 
 * @param {number} filter.row
 * @param {number} filter.column
 * @param {string} filter.timestamp
 * @param {string} filter.updatedSince
 * @param {string} filter.updatedBefore
 * @param {string} filter.sort
 * @param {boolean} filter.latest
 * @param {boolean} filter.reduced
 * @param {number} filter.limit
 * @param {number} filter.skip
 * @param {string} filter.robotId
 * @returns {array<chunk>} chunks
 */
async function getChunks(filter) {
    if((filter.latest && filter.updatedBefore) || filter.reverse){
        let esResult = await performMsearchForEachChunk(filter);
        return transformMsearchResult(esResult);
    }


    // build query body
    let query = {};
    let match = [];
    let range;

    if (filter.row)
        match.push({match: {row: filter.row}});
    if (filter.column)
        match.push({match: {column: filter.column}});
    if (filter.timestamp)
        match.push({match: {timestamp: filter.timestamp}});
    if (filter.robotId)
        match.push({match: {robotId: filter.robotId}});
    if(filter.updatedSince || filter.updatedBefore)
        range = {};
    if(filter.updatedSince)
        range.gte = filter.updatedSince;
    if(filter.updatedBefore)
        range.lte = filter.updatedBefore;
    if(range)
        match.push({range: {timestamp: range}});
    
    query.bool =  {must: match};

    

    let searchRequest = {
        index: (filter.latest) ? INDEX_LATEST : INDEX,
        size: filter.limit || 10,
        from: filter.skip || 0,        
        type: TYPE,
        body: {
            query: query
        },
        sort: filter.sort || 'timestamp:desc',
    };

    //console.log(JSON.stringify(searchRequest));

    if(filter.reduced)
        searchRequest._sourceExclude = ['pngB64', 'pgmB64compressed'];
    
    const esResult = await esClient.search(searchRequest);

    return esResult;
}

async function getChunkById(id){
    return await esClient.get({
        index: INDEX,
        type: 'chunk',
        id: id
    });
}

/**
 * Queries for each latest chunk at a given date
 * @param {*} filter 
 */
async function performMsearchForEachChunk(filter){
    if(filter.reverse) {
        // TODO: add code here
    } else {
        let body = getMserachBody(await getChunkIdsForFilter(filter));
        let esResult = await esClient.msearch({body:body});
        return esResult;
    }
    
}

/**
 * 
 * @param {object} filter 
 * @param {number} filter.row
 * @param {number} filter.column
 * @param {string} filter.updatedBefore
 */
async function getChunkIdsForFilter(filter){
    let chunkIds = [];

    let esResult = await esClient.get({
        index: 'meta',
        type: 'meta.json',
        id: 1
    });

    let meta = esResult._source;
    let minRow = 0;
    let maxRow = meta.CHUNK_ROWS;
    let minCol = 0;
    let maxCol = meta.CHUNK_COLS;

    if(filter.row){
        minRow = filter.row;
        maxRow = filter.row + 1;
    }

    if(filter.column){
        minCol = filter.column;
        maxCol = filter.column +1;
    }

    for(let row = minRow; row < maxRow; row++){
        for(let col = minCol; col < maxCol; col++){
            chunkIds.push({row: row, col: col, updatedBefore: filter.updatedBefore});
        }
    }
    return chunkIds;
}

/**
 * Creates the query body for the search of each latest chunk at a given date
 * @param {array<chunkId>} chunkIds
 * @param {number} chunkId.row
 * @param {number} chunkId.column
 * @param {string} chunkId.updatedBefore
 * @returns {object} msearch body
 */
function getMserachBody(chunkIds) {
    let body = [];

    let searchMeta = {
        index: INDEX,    
        type: TYPE
    };

    chunkIds.forEach((chunkId)=>{
        let range = {
            lte: chunkId.updatedBefore
        };
        let chunkQuery = {
            'query':{
                'bool': {
                    'must': [
                        { 'range': {'timestamp': range }},
                        { 'match': {'row': chunkId.row }},
                        { 'match': {'column': chunkId.col }}
                    ]
                }
            },            
            'size': 1,
            'sort': [
                {
                    'timestamp': 'desc'
                }
            ]
        };
        body.push(searchMeta);
        body.push(chunkQuery);
    });

    return body;
}

/**
 * Get a list of all robotIds
 * @returns {array<string>} robotIds
 */
async function getRobots(){
    // build query body
    let query = {};
    let match = [];
    
    query.bool =  {must: match};

    let searchRequest = {
        index: INDEX_LATEST,
        size: 10000,
        type: TYPE,
        body: {
            query: query
        },
        _sourceInclude: [ 'robotId' ]
    };

    //console.log(JSON.stringify(searchRequest));
    
    const esResult = await esClient.search(searchRequest);
    let robots = [];
    esResult.hits.hits.forEach((esr)=>{
        robots.push(esr._source.robotId);
    });
    return robots;
}

/**
 * Transforms the result of an msearch into a typical esresult
 * @param {object} esResult
 * @returns {Array<object>} results
 */
function transformMsearchResult(esResult){
    if(esResult.responses){
        esResult.hits = {
            total: 0,
            hits: []
        };
        esResult.responses.forEach((response)=>{
            response.hits.hits.forEach((hit)=>{
                esResult.hits.total++;
                esResult.hits.hits.push(hit);
            });
        });
    }
    return esResult;
}

async function readMeta(req, res) {
    try {
        // Load meta data from database
        let esResult = await esClient.get({
            index: 'meta',
            type: 'meta.json',
            id: 1
        });

        let meta = esResult._source;
        
        // Add chunk resource path
        meta.chunk_resource_path = '/api/chunk-service/chunks/id/';
        res.json(meta);
    } catch (err) {
        console.log(err);
        res.status(err.status || 400);
        res.json(err);
    }
}

async function createMeta(req, res) {
    esClient.createIndexIfNotExists('meta');
    // Create a new meta data entry
    try {
        let metaJson = req.body;
        let esresult = await esClient.index({
            index: 'meta',
            type: 'meta.json',
            body: metaJson,
            id: 1
        });

        res.json({}).status(200);
    } catch (err) {
        console.log(err);
        res.status(err.status || 400);
        res.json(err);
    }
}

async function deleteMeta(req, res) {
    try {
        let esresult = await esClient.delete({
            index: 'meta',
            type: 'meta.json',
            id: 1
        });

        res.json({}).status(200);
    } catch (err) {
        console.log(err);
        res.status(err.status || 400);
        res.json(err);
    }
}

module.exports.getChunkById = getChunkById;
module.exports.saveChunk = saveChunk;
module.exports.getChunks = getChunks;
module.exports.readMeta = readMeta;
module.exports.createMeta = createMeta;
module.exports.deleteMeta = deleteMeta;
module.exports.dropIndex = dropIndex;
module.exports.getIndexHealth = getIndexHealth;

