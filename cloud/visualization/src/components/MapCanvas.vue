<!-- https://vuejsexamples.com/vue-chart-component-example-with-chart-js/ -->
<!-- https://github.com/risan/vue-chart-example/ -->
<template>
  <canvas
    :ref="canvasRef"
    :width="width"
    :height="height"
    :style="{width: `${initialScaleFactor*width}px`, height: `${initialScaleFactor*height}px`, position: `absolute`, top:`0px`, left:`0px`}"
  />
</template>

<script>
import { mqttUtil } from '@/js/mqttUtil.js'
import { toChunkRowColumn } from '@/js/stateUtil.js'
import ChunkBuffer from '@/js/chunkBuffer.js'

export default {
  name: 'MapCanvas',
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
      canvasRef: 'canvas',
      // imageMap to save Images Object that draw on canvas on .src change
      imageMap: null
    }
  },
  computed: {
    map: function () {
      return this.$store.state.map
    },
    height: function () {
      return this.metadata.height
    },
    width: function () {
      return this.metadata.width
    },
    chunkRowNumber: function () {
      return this.metadata.CHUNK_ROWS
    },
    chunkColumnNumber: function () {
      return this.metadata.CHUNK_COLS
    },
    chunkHeight: function () {
      return this.metadata.CHUNK_HEIGHT
    },
    chunkWidth: function () {
      return this.metadata.CHUNK_WIDTH
    }

  },
  watch: {
    // Update at each clock tick
    map: function (newMap, oldMap) {
      // this.redrawMap()

      if (!newMap) {
        // Map has not been set
        return
      }
      for (let chunkRow = 0; chunkRow < this.chunkRowNumber; chunkRow++) {
        for (let chunkColumn = 0; chunkColumn < this.chunkColumnNumber; chunkColumn++) {
          this.redrawChunk(chunkRow, chunkColumn, newMap[chunkRow][chunkColumn].chunk)
        }
      }
    }
  },
  mounted: function () {
    this.initImageMap()
    // this.redrawMap()

    mqttUtil.on('chunk-live-update', (chunk) => {
      if (this.isLive) {
        this.redrawChunk(chunk.row, chunk.column, chunk.png)
      }
    })
    ChunkBuffer.on('update', (chunk) => {
      this.redrawChunk(chunk.row, chunk.column, chunk.chunk)
    })
  },
  methods: {
    toChunkRowColumn: toChunkRowColumn,
    getLatestTimestamp: function (chunkRowColumn) {
      const timestampList = this.$store.getters.getSortedTimestampList(chunkRowColumn)
      return timestampList[timestampList.length - 1]
    },
    getLatestChunk: function (row, column) {
      const map = this.map || {}
      const prefix = 'data:image/png;base64,'
      const undef = prefix
      if (!map[row] || !map[row][column]) {
        return undef
      } else {
        return prefix + map[row][column].chunk
      }
    },
    // Initialize the Image Objects that draw on the canvas. Can be done without having chunk data yet.
    initImageMap: function () {
      this.imageMap = {}
      const ctx = this.$refs[this.canvasRef].getContext('2d')
      for (let chunkRow = 0; chunkRow < this.chunkRowNumber; chunkRow++) {
        this.imageMap[chunkRow] = {}
        // for (const [chunkColumn, chunk] of Object.entries(columnChunks)) {
        for (let chunkColumn = 0; chunkColumn < this.chunkColumnNumber; chunkColumn++) {
          this.imageMap[chunkRow][chunkColumn] = new Image()
          const img = this.imageMap[chunkRow][chunkColumn]
          img.onload = () => {
            ctx.drawImage(img, chunkColumn * this.chunkWidth, chunkRow * this.chunkHeight)
          }
        }
      }
    },

    // Redraw full map
    redrawMap: function () {
      if (this.map === undefined) { return }
      for (const [chunkRow, columnChunks] of Object.entries(this.map)) {
        for (const [chunkColumn, chunk] of Object.entries(columnChunks)) {
          const img = new Image()
          const ctx = this.$refs[this.canvasRef].getContext('2d')
          img.onload = () => {
            ctx.drawImage(img, chunkColumn * this.chunkWidth, chunkRow * this.chunkHeight)
          }
          img.src = `data:image/png;base64,${chunk.chunk}`
        }
      }
    },
    // Instigate redraw of specific chunk (invokes Image onLoad callback)
    redrawChunk: function (chunkRow, chunkColumn, chunkPng, timestamp = -1) {
      const imageSrc = `data:image/png;base64,${chunkPng}`
      this.imageMap[chunkRow][chunkColumn].src = imageSrc
      return imageSrc
    }
  }
}
</script>
