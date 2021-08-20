const config = require('./config')
const robotBaseUrl = config.API_URL + '/api/coordinate-service'
const robotQueryUrl = robotBaseUrl + '/robots'

const axios = require('axios')

const robotByUniqueIdUrl = uniqueID => robotQueryUrl + `/?robotId=${uniqueID}`

// get latest information about all robots
export const getLatestRobots = async function (updatedBefore) {
  // create query parameters
  let queryParameters = '?latest=true&limit=1000'
  if (updatedBefore) {
    queryParameters += '&updatedBefore=' + new Date(updatedBefore).toISOString()
  }

  // perform query
  let res = await axios.get(robotQueryUrl + queryParameters)
  let robots = {}
  res.data.forEach(element => {
    robots[element.robotId] = {
      timestamp: element.timestamp,
      pose: element.pose,
      status: element.status
    }
  })
  return robots
}

export async function getRobotUpdates (rangeStart, rangeEnd, sort) {
  // create query parameters
  let limit = 1000
  let queryParameters = '?limit=' + limit
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
    let res = await axios.get(robotQueryUrl + queryParameters + skip)
    responseLength = res.data.length
    result = result.concat(res.data)
    skip += limit
  }

  return result
}

// get information at certain timestep about all robots
export const getTimestepRobots = async function (timestamp) {
  let res = await axios.get(robotQueryUrl + `?latest=true&updatedBefore=${timestamp}&limit=1000`)
  let robots = {}
  res.data.forEach(element => {
    robots[element.robotId] = {
      timestamp: element.timestamp,
      pose: element.pose,
      status: element.status
    }
  })
  return robots
}

// Get latest information about single robot by id
export const getLatestRobotData = async function (uniqueID) {
  try {
    let res = await axios.get(robotByUniqueIdUrl(uniqueID) + '?latest=true')
    return res.json()
  } catch (error) {
    console.log(`Failed to get robot for uniqueID ${uniqueID}: ${error}`)
    return null
  }
}

// Get information at timestamp about single robot by id
// TODO maybe if you only want to follow selected robots
export const getTimestampRobotData = async function (uniqueID, timestamp) {
  try {
    let res = await axios.get(robotByUniqueIdUrl(uniqueID) + `?latest=true&updatedBefore=${timestamp}`)
    return res.json()
  } catch (error) {
    console.log(`Failed to get robot for uniqueID ${uniqueID}: ${error} at timestamp ${timestamp}`)
    return null
  }
}

// Get information before timestamp about single robot by id
// TODO to display the trail of a robot
export const getTrailRobotData = async function (uniqueID, timestamp) {
  try {
    let res = await axios.get(robotByUniqueIdUrl(uniqueID) + `?updatedBefore=${timestamp}&limit=1000`)
    return res.json()
  } catch (error) {
    console.log(`Failed to get robot trail for uniqueID ${uniqueID}: ${error} at timestamp ${timestamp}`)
    return null
  }
}
