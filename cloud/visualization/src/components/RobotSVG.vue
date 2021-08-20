<!-- https://vuejsexamples.com/vue-chart-component-example-with-chart-js/ -->
<!-- https://github.com/risan/vue-chart-example/ -->
<template>
  <svg
    ref="robot-layer"
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    :style="{width: `${initialScaleFactor*width}px`, height: `${initialScaleFactor*height}px`, position: `absolute`, top:`0px`, left:`0px`, zIndex:`51`}"
  />
</template>

<script>
import { mqttUtil } from '@/js/mqttUtil.js'
import RobotBuffer from '@/js/robotBuffer.js'
const THREE = require('three')
// import { getLatestX } from '@/js/restUtilRobots.js'
// import { toChunkRowColumn } from '@/js/stateUtil.js'

export default {
  name: 'RobotSVG',
  components: {
    //
  },
  props: {
    // The metadata object containing metadata.width, metadata.height, metadata.CHUNK_ROWS, metadata.CHUNK_COLS.
    metadata: {
      type: Object,
      default: value => ({ width: 1000, height: 1000, CHUNK_ROWS: 10, CHUNK_COLS: 10 }) // TODO: correct default values for map
      // validator: value => value > 0  // TODO validator to have all necessary elements
    },
    isLive: {
      type: Boolean,
      default: value => true
    },
    initialScaleFactor: {
      type: Number,
      default: value => 1
    }
  },
  data () {
    return {
      robotArrows: {}
    }
  },
  computed: {
    height: function () {
      return this.metadata.height
    },
    width: function () {
      return this.metadata.width
    },
    chunkRowNumber: function () {
      return this.metadata.CHUNK_ROWS
    },
    chunkColNumber: function () {
      return this.metadata.CHUNK_COLS
    },
    chunkHeight: function () {
      return this.metadata.CHUNK_HEIGHT
    },
    chunkWidth: function () {
      return this.metadata.CHUNK_WIDTH
    },
    robots: function () {
      return this.$store.state.robots
    }
  },
  watch: {
    robots: function (robots) {
      const svg = this.$refs['robot-layer'] // Get svg element
      for (const key of Object.keys(this.robotArrows)) {
        svg.removeChild(this.robotArrows[key])
      }
      this.robotArrows = {}

      if (!robots) {
        return
      }
      for (const robotId of Object.keys(robots)) {
        let robot = robots[robotId]
        if (robot) {
          this.drawRobot(robot.pose.position.x, robot.pose.position.y, robot.pose.orientation, robotId)
        }
      }
    }
  },
  mounted () {
    mqttUtil.on('robot-live-update', (robot) => {
      if (this.isLive) {
        this.drawRobot(robot.pose.position.x, robot.pose.position.y, robot.pose.orientation, robot.robotId)
      }
    })
    RobotBuffer.on('update', (robot) => {
      this.drawRobot(robot.pose.position.x, robot.pose.position.y, robot.pose.orientation, robot.robotId)
    })
  },
  methods: {
    drawRobot: function (x, y, quaternion, robotId) {
      // TODO: diplay robotId onclick/onhover
      // TODO: use quaternion to calculate angle

      const arrowHeight = 40
      const arrowWidth = 48
      const arrowDip = 10
      // const width = this.width || 1920
      // const height = this.height || 1080

      const svg = this.$refs['robot-layer'] // Get svg element
      const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      if (this.robotArrows[robotId]) {
        svg.removeChild(this.robotArrows[robotId])
      }

      // robot angle
      let q = new THREE.Quaternion(quaternion.w, quaternion.x, quaternion.y, quaternion.z)

      // base angle
      let qId = new THREE.Quaternion(1, 0, 0, 0)

      // get angle in radians
      let aRad = q.angleTo(qId)

      // angle in degrees
      let aDeg = aRad * 180 / Math.PI
      aDeg = aDeg * Math.sign(quaternion.z * quaternion.w)

      const xPos = x // width * 1920
      const yPos = y // height * 1080
      arrow.setAttribute('points', `${arrowDip},${arrowWidth / 2} 0,0 ${arrowDip + arrowHeight},${arrowWidth / 2} 0,${arrowWidth}`)
      arrow.setAttribute('transform', `translate(${xPos} ${yPos}) rotate(${aDeg} 0 0) translate(-${arrowDip} -${arrowWidth / 2})`)
      arrow.setAttribute('stroke', 'black')
      arrow.setAttribute('stroke-width', '2')
      arrow.setAttribute('fill', 'red')
      svg.appendChild(group)
      group.appendChild(arrow)
      text.setAttribute('x', xPos + 50)
      text.setAttribute('y', yPos)
      text.textContent = robotId
      text.setAttribute('font-size', 50)

      group.appendChild(text)

      this.robotArrows[robotId] = group
      return group
    }
  }
}
</script>
<style>

</style>
