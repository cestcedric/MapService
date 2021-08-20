import Buffer from './buffer'
const getChunkUpdates = require('./restUtilChunks').getChunkUpdates

class ChunkBuffer extends Buffer {
  constructor () {
    super('ChunkBuffer', getChunkUpdates)
  }
}

const SingleInstance = new ChunkBuffer()

export default SingleInstance
