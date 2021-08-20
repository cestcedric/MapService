process.env.ES_INDEX = 'chunks-test';

const EsChunkService = require('../chunk_es_client');
const assert = require('chai').assert;

const chunk = 'eNrt1rERwyAQRUG36HLcjlukABzIAbKPSAcDmt1cehHwSwEAAGA1rwkeLOU5wRsgVAMaGhpbNo6Pv+ui/VVyo9kwoxqnoTSm8bPGRjT+Jt+ejWC7aqzYSHSXRvd87Nbo3Vepjc69m9uI34/kRvgOpjfGTgMA4LJaP+5s4R0=';

describe('Chunk Service Elasticsearch Interface', function () {
    before(async function () {
    //do nothing
    });
    it('Test save chunk', async function () {
        this.timeout(10000);
        let esresult = await EsChunkService.saveChunk({row:1, column:2, timestamp: new Date().toISOString(), pgmB64compressedData: chunk});
        assert(esresult.result === 'created', 'chunk was not saved successfully');
    });
    async function saveRandomChunk(){
        let value = {
            row: Math.round(Math.random()*100),
            column: Math.round(Math.random()*100),
            timestamp: new Date().toISOString()
        };
        await EsChunkService.saveChunk({
            row: value.row,
            column: value.column,
            timestamp: value.timestamp,
            pgmB64compressedData: chunk
        });
        return value;
    }
    it('Test get chunk', async function () {
        this.timeout(10000);

        let firstValue = await saveRandomChunk();
        let secondValue = await saveRandomChunk();
        let thirdValue = await saveRandomChunk();
        
        //console.log(await EsChunkService.getIndexHealth());

        // query them
        let result = await EsChunkService.getChunks({});
        let firstCount = result.hits.total;
        // test that it returns something 
        assert(firstCount > 0, 'No chunks returned. This can happen, if the index has just '+
        'been newly created. Try to rerun this test.');
        // test the row and column filter
        result = await EsChunkService.getChunks({row:firstValue.row, column:firstValue.column});
        let secondCount = result.hits.total;
        assert(secondCount > 0, 'No chunks returned. Should show the chunks with row '+firstValue.row+
        ' and column '+firstValue.column+'.');
        assert(firstCount > secondCount, 'Should show less results for second count');
        // test chunk identification
        result = await EsChunkService.getChunks({row:secondValue.row, column:secondValue.column, timestamp: secondValue.timestamp});
        assert.equal(result.hits.total, 1, 'should return only one result since row, '+
        'column and timestamp identify one item only');
        // test updaredSince
        result = await EsChunkService.getChunks({updatedSince: secondValue.timestamp});
        assert.equal(result.hits.total, 2, 'Should return two results that have been updated since '+secondValue.timestamp);
        // test limit
        result = await EsChunkService.getChunks({limit: 2});
        assert.equal(result.hits.hits.length, 2, 'should return only two results');
        // test skip
        let skippedResult = await EsChunkService.getChunks({limit: 2, skip: 1});
        assert.equal(result.hits.hits[1]._id, skippedResult.hits.hits[0]._id, 'should be the same.');
        // test sort ascending
        result = await EsChunkService.getChunks({sort:'timestamp:asc'});
        let lastTimestamp = new Date(0);
        result.hits.hits.forEach((chunk) => {
            assert(lastTimestamp <= new Date(chunk._source.timestamp), 'not sorted correctly');
            lastTimestamp = new Date(chunk._source.timestamp);
        });
        // test sort descending
        lastTimestamp = Date.now();
        result = await EsChunkService.getChunks({sort:'timestamp:desc'});
        result.hits.hits.forEach((chunk) => {
            assert(lastTimestamp >= new Date(chunk._source.timestamp), 'not sorted correctly');
            lastTimestamp = new Date(chunk._source.timestamp); 
        });
    });

    async function saveSameChunk(){
        let value = {
            row: 5,
            column: 5,
            timestamp: Date.now(),
            pgmB64compressedData: chunk
        };
        await EsChunkService.saveChunk(value);
        return value;
    }
    it('Test get latest', async function () {
        this.timeout(10000);

        let firstValue = await saveSameChunk();
        let secondValue = await saveSameChunk();
        let thirdValue = await saveSameChunk();

        let result = await EsChunkService.getChunks({row: 5, column: 5, latest: true});
        assert.equal(result.hits.hits[0]._source.timestamp, thirdValue.timestamp, 'not latest timestamp');
    });
    after(async function(){
        await EsChunkService.dropIndex();
        //await timeout(1000);
        //process.exit();
    });
});

/**
 * 
 * @param {number} time  time in millisec
 */
async function timeout(time){
    return new Promise((resolve) => {
        setTimeout(function(){
            resolve();
        }, time);
    });
}