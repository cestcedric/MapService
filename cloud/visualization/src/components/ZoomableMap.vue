<!-- https://vuejsexamples.com/vue-chart-component-example-with-chart-js/ -->
<!-- https://github.com/risan/vue-chart-example/ -->
<template>
  <div
    ref="mapLayer"
    class="map-layer"
  >
    <MapCanvas
      :metadata="metadata"
      :initial-scale-factor="initialScaleFactor"
      :is-live="isLive"
    />
    <RobotSVG
      :metadata="metadata"
      :initial-scale-factor="initialScaleFactor"
      :is-live="isLive"
    />
  </div>
</template>

<script>
import panzoom from 'panzoom'

import MapCanvas from '@/components/MapCanvas.vue'
import RobotSVG from '@/components/RobotSVG.vue'

export default {
  name: 'ZoomableMap',
  components: {
    MapCanvas,
    RobotSVG
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
    }
  },
  data () {
    return {
      //
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
    initialScaleFactor: function () {
      let scaleFactor = Math.max(window.innerHeight / this.metadata.height, window.innerWidth / this.metadata.width)
      console.log('window height ' + window.innerHeight)
      console.log('initial scale factor ' + scaleFactor)
      return scaleFactor
    }

  },
  mounted () {
    this.makeMapZoomable()
  },
  methods: {
    makeMapZoomable: function () {
      panzoom(this.$refs.mapLayer)
    }
  }
}
</script>
<style>
.map-layer{
  position: absolute;
  z-index: 50;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin: 0;
}
html {
  overflow-y: hidden;
}
</style>
