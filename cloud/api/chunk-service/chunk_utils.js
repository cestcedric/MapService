let zlib = require('zlib');
let stream = require('stream');
let exec = require('child_process').exec;

// Helper functions that are required to process incoming chunks

function decompressB64EncodedChunk(b64EncodedChunk) {
    return new Promise((resolve, reject) => {
        let compressedChunkBuffer = Buffer.from(b64EncodedChunk, 'base64');
        zlib.inflate(compressedChunkBuffer, (err, chunkBuffer) => {
            if (err) {
                return reject(err);
            }

            resolve(chunkBuffer);
        });
    });
}

function assemblePGM(meta, rawChunkBuffer) {
    let magicNumberBuffer = Buffer.from('P5\n', 'ascii');
    let commentBuffer = Buffer.from('# assembled by cloud\n', 'ascii');
    // TODO: Values for the following parameters should be loaded from meta.json
    let sizeBuffer = Buffer.from('100 100\n', 'ascii');
    let brightnessBuffer = Buffer.from('255\n', 'ascii');
    return Buffer.concat([magicNumberBuffer, commentBuffer, sizeBuffer, brightnessBuffer, rawChunkBuffer]);
}

function convertPGMToPNG(pgmBuffer) {
    return new Promise((resolve, reject) => {
        let child = exec('pnmtopng -compression 9 -', {'encoding': 'buffer'}, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(stdout);
        });

        let stdinStream = new stream.Readable();
        stdinStream.push(pgmBuffer);
        stdinStream.push(null);
        stdinStream.pipe(child.stdin);
    });
}

function processChunkFromCompressedBinary(b64EncodedCompressedChunk) {
    return decompressB64EncodedChunk(b64EncodedCompressedChunk)
        .then((chunkBuffer) => {
            let pgmBuffer = assemblePGM({}, chunkBuffer);
            return convertPGMToPNG(pgmBuffer);
        });
}

module.exports = processChunkFromCompressedBinary;