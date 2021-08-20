// Initialize esClient
const esClient = require('common-api-files').esClient;
const assert = require('assert');

const INDEX = process.env.ES_INDEX || 'coordinates';
const INDEX_LATEST = INDEX + '-latest';
const TYPE = process.env.ES_TYPE || 'coordinate';

/**
 * 
 * @param {object} robotInfo 
 * @param {string} robotInfo.robotId
 * @param {string} robotInfo.timestamp
 * @param {string} robotInfo.pose
 * @param {string} robotInfo.status
 * @returns {object} esresult
 */
async function saveCoordinate(robotInfo) {
    await esClient.createIndexIfNotExists(INDEX);
    await esClient.createIndexIfNotExists(INDEX_LATEST);

    // compare to latest info
    try {
        let latestInfo = await getCoordinate({robotId: robotInfo.robotId, latest: true});
        // console.log('latest info:' + JSON.stringify(latestInfo));
        latestInfo = latestInfo[0];
        if(latestInfo){
            assert(latestInfo.timestamp <= robotInfo.timestamp, 'this robot data is outdated');
        }
    } catch (e) {
        // ignore if index is empty
        if(!e.body)
            throw new Error(e);
        if(e.body.status !== 404)
            throw new Error(e);
    }

    let body = {
        'robotId': robotInfo.robotId,
        'timestamp': robotInfo.timestamp,
        'pose': robotInfo.pose,
        'status': robotInfo.status
    };

    // Make data persistent
    let esresult = await
    esClient.index({
        index: INDEX,
        type: TYPE,
        id: 'robotId:'+robotInfo.robotId+'_'+robotInfo.timestamp,
        body: body,
        refresh: 'true'
    });

    // Overwrite latest index for faster search
    await esClient.index({
        index: INDEX_LATEST,
        type: TYPE,
        id: 'robotId:'+robotInfo.robotId+'_latest',
        body: body,
        refresh: 'true'
    });

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
 * @param {string} filter.robotId
 * @param {string} filter.timestamp
 * @param {string} filter.updatedSince
 * @param {string} filter.updatedBefore
 * @param {string} filter.sort
 * @param {boolean} filter.latest
 * @param {number} filter.limit
 * @param {number} filter.skip
 * @returns {array<robotData>} robotInfos
 */
async function getCoordinate(filter) {
    if(filter.latest && filter.updatedBefore)
        return transformEsResult(await performMsearchForEachRobot(filter));

    // build query body
    let query = {};
    let match = [];
    let range;

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
        index: (filter.latest && !filter.updatedBefore) ? INDEX_LATEST : INDEX,
        size: filter.limit || 10,
        from: filter.skip || 0,        
        type: TYPE,
        body: {
            query: query
        },
        sort: filter.sort || 'timestamp:desc',
    };

    //console.log(JSON.stringify(searchRequest));
    
    const esResult = await esClient.search(searchRequest);

    return transformEsResult(esResult);
}

/**
 * Queries the latest position of each robot at a given date. msearch perfoms multiple searches at the same time.
 * @param {*} filter 
 */
async function performMsearchForEachRobot(filter){
    let body = await getMserachForEachRobot(filter);
    let esResult = await esClient.msearch({body:body});
    return esResult;
}

/**
 * Creates the query body for the search of each 
 * @param {object} filter 
 * @param {string} filter.robotId
 * @param {string} filter.updatedBefore
 * @returns {array<robotData>} robotInfos
 */
async function getMserachForEachRobot(filter) {
    let body = [];
    let robots = [];

    if(filter.robotId)
        robots = [filter.robotId];
    else
        robots = await getRobots();

    let range = {
        lte: filter.updatedBefore
    };

    let searchMeta = {
        index: INDEX,    
        type: TYPE
    };

    robots.forEach((robotId)=>{
        let robotQuery = {
            'query':{
                'bool': {
                    'must': [
                        { 'range': {'timestamp': range }},
                        { 'match': {'robotId': robotId }}
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
        body.push(robotQuery);
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
 * Transforms the esresult to an array of elements
 * @param {object} esResult
 * @returns {Array<object>} results
 */
function transformEsResult(esResult){
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

    let hits = esResult.hits.hits;
    let results = [];
    hits.forEach((hit)=>{
        let robotInfo = hit._source;
        robotInfo._id = hit._id;
        results.push(robotInfo); 
    });
    return results;
}


module.exports.saveCoordinate = saveCoordinate;
module.exports.getCoordinate = getCoordinate;
module.exports.dropIndex = dropIndex;
module.exports.getIndexHealth = getIndexHealth;

