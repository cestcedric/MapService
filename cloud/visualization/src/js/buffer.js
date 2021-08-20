const EventEmitter = require('events')

class Buffer extends EventEmitter {
  constructor (name, fetchMethod) {
    super()
    this.name = name
    this.fetchMethod = fetchMethod
    this.bufferRangeStart = Date.now()
    this.bufferRangeEnd = Date.now()
    this.queue = []
    this.numberOfSkips = 0
  }

  async update (timestamp, replaySpeed, frameRate, isLive) {
    if (isLive) { return }
    this.timestamp = timestamp
    this.replaySpeed = replaySpeed
    this.frameRate = frameRate

    if (this.buffering) {
      return
    }

    if ((timestamp - this.bufferRangeStart) * (timestamp - this.bufferRangeEnd) > 0) {
      console.log(this.name + ' exceeding range, timestamp: ' + timestamp, timestamp - this.bufferRangeStart, timestamp - this.bufferRangeEnd, this.bufferRangeEnd)
      this.reload()
    } else {
      await this.publishUpdates()
    }

    await this.buffer()
  }

  wipeBuffer () {
    console.log(this.name + ': wipe buffer')
    this.bufferRangeStart = this.timestamp
    this.bufferRangeEnd = this.timestamp
    this.numberOfSkips = 0
    this.queue = []
  }

  async reload () {
    this.emit(this.name + ': buffering')
    this.wipeBuffer()
    await this.buffer()
    this.emit(this.name + ': done-buffering')
  }

  async buffer () {
    // do not buffer simultaneously
    if (this.buffering) {
      return
    }

    // only buffer every 2 seconds
    if (this.numberOfSkips > 0) {
      this.numberOfSkips--
      // console.log('skip', this.numberOfSkips, this.buffering)
      return
    }
    this.buffering = true
    this.numberOfSkips = 2 * this.frameRate

    // prepare query to buffer next 10 seconds
    let rangeStart = this.bufferRangeEnd
    let rangeEnd = this.timestamp + 10 * this.replaySpeed * 1000

    // query updates
    try {
      let updates = await this.fetchMethod(rangeStart, rangeEnd, this.replaySpeed)
      updates.forEach((update) => {
        this.queue.push(update)
      })
      console.log(`${this.name}: ${updates.length} updates`)
    } catch (e) {
      console.error(`${this.name}: An error ocurred while buffering: ${e}`)
    }

    // set range start and range end
    this.bufferRangeEnd = rangeEnd
    this.bufferRangeStart = this.timestamp
    this.buffering = false
  }

  publishUpdates () {
    if (this.replaySpeed === 0) {
      return
    }
    while (this.queue.length > 0) {
      let nextTime = new Date(this.queue[0].timestamp).getTime()
      // console.log('diff', nextTime - this.timestamp)
      if ((nextTime - this.timestamp) * Math.abs(this.replaySpeed) <= 0) {
        let update = this.queue.shift()
        this.emit('update', update)
      } else {
        return
      }
    }
  }
}

export default Buffer
