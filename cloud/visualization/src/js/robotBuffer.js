import Buffer from './buffer'
const getRobotUpdates = require('./restUtilRobot').getRobotUpdates

class RobotBuffer extends Buffer {
  constructor () {
    super('RobotBuffer', getRobotUpdates)
  }
}

const SingleInstance = new RobotBuffer()

export default SingleInstance
