const config = require('./config')
const chunkBaseUrl = config.API_URL + '/api/chunk-service'
const chunkQueryUrl = chunkBaseUrl + '/chunks'
const chunkMetaUrl = chunkBaseUrl + '/meta'

const axios = require('axios')

// const chunkByUniqueIdUrl = uniqueID => chunkQueryUrl + `/id/${uniqueID}`

// Fetch Metadata from chunk service
export async function getChunkMeta () {
  try {
    let res = await axios.get(chunkMetaUrl)
    // TODO use res.json ?
    const meta = res.data
    console.log('restUtil meta result: ' + JSON.stringify(meta))
    return meta
  } catch (error) {
    console.log(`restUtil meta Error: ${error}`)
    return null
  }
}

export async function getLatestMap (meta, updatedBefore) {
  // create query parameters
  let queryParameters = '?latest=true&type=png&limit=' + parseInt(meta.CHUNK_ROWS * meta.CHUNK_COLS)
  if (updatedBefore) {
    queryParameters += '&updatedBefore=' + new Date(updatedBefore).toISOString()
  }

  // perform query
  let res = await axios.get(chunkQueryUrl + queryParameters)
  let map = {}
  res.data.forEach(element => {
    map[element.row] = map[element.row] || {}
    map[element.row][element.column] = {
      timestamp: element.timestamp,
      chunk: element.chunk
    }
  })
  return map
}

export async function getChunkUpdates (rangeStart, rangeEnd, sort) {
  // create query parameters
  let limit = 1000
  let queryParameters = '?type=png&limit=' + limit
  let updatedSince = (rangeStart < rangeEnd) ? rangeStart : rangeEnd
  let updatedBefore = (rangeStart < rangeEnd) ? rangeEnd : rangeStart
  queryParameters += '&updatedSince=' + new Date(updatedSince).toISOString()
  queryParameters += '&updatedBefore=' + new Date(updatedBefore).toISOString()
  queryParameters += '&sort='
  queryParameters += (sort > 0) ? 'timestamp:asc' : 'timestamp:desc'
  queryParameters += '&skip='

  let result = []
  let responseLength = limit
  let skip = 0

  // perform query
  while (responseLength === limit) {
    let res = await axios.get(chunkQueryUrl + queryParameters + skip)
    responseLength = res.data.length
    result = result.concat(res.data)
    skip += limit
  }

  return result
}

// Get single chunk by id
/*
  export const getChunkData = function (uniqueID) {
  fetch(chunkByUniqueIdUrl(uniqueID))
    .then((res) => res.json())
    .then((chunkData) => {
      return chunkData
    })
    .catch(error => {
      console.log(`Failed to get chunk for uniqueID ${uniqueID}: ${error}`)
      return null
    })
}
*/

/* export const getChunkData = async function (uniqueID) {
  try {
    let res = await axios.get(chunkByUniqueIdUrl(uniqueID))
    return res.json()
  } catch (error) {
    console.log(`Failed to get chunk for uniqueID ${uniqueID}: ${error}`)
    return null
  }
}

// Get full chunk history
// TODO: only for relevant timeframe
export async function getChunkList () {
  try {
    const res = await axios.get(chunkQueryUrl)
    const chunkList = res.data
    console.log(`restUtil chunkList result of length ${chunkList.length}.`) // ${JSON.stringify(chunkList)}
    console.log(`restUtil chunkList first result: ${JSON.stringify(chunkList[0])}.`) // ${JSON.stringify(chunkList)}
    return chunkList
  } catch (error) {
    console.log(`restUtil chunkList Error: ${error}`)
    return null
  }
}

// TODO Get chunk image source
/*
  export const getChunkImage = function (pngURL) {
  fetch(pngURL)
    .then((res) => res.json())
    .then((chunkImage) => {
      return chunkImage
    })
    .catch(error => {
      console.log(`Failed to get chunk chunkImage for pngURL ${pngURL}: ${error}`)
      return null
    })
}
*/
/* export const getChunkImage = async function (pngURL) {
  try {
    let res = await axios.get(pngURL)
    return res.json
  } catch (error) {
    console.log(`Failed to get chunk chunkImage for pngURL ${pngURL}: ${error}`)
    return null
  }
} */
