<template>
  <!-- MAIN CONTENT-->
  <div class="main-content">
    <div class="map-wrap">
      <!--<canvas id="canvas" />-->
      <ZoomableMap
        v-if="metadata"
        :metadata="metadata"
        :is-live="isLive"
      />
    </div>
    <!-- Slider Navigation -->
    <div class="bottom-fixed application theme--dark">
      <VContainer
        fluid

        align-center
        justify-center
        align-content-space-around
      >
        <VLayout
          row
          align-center
          justify-space-around
        >
          <!-- https://vuetifyjs.com/en/framework/grid -->
          <VFlex
            xs2
            class="timelineNavigation"
          >
            <VContainer>
              <VLayout
                row
                align-center
                justify-space-between
              >
                <VFlex>
                  <VIcon
                    @click="play(-1)"
                  >
                    fast_rewind
                  </VIcon>
                </VFlex>
                <VFlex>
                  <VProgressCircular
                    v-if="isBuffering"
                    indeterminate
                    :size="24"
                    @click="play(0)"
                  />
                  <VIcon
                    v-else-if="replaySpeed"
                    @click="play(0)"
                  >
                    pause
                  </VIcon>
                  <VIcon
                    v-else
                    @click="play(1)"
                  >
                    play_arrow
                  </VIcon>
                </VFlex>
                <VFlex>
                  <span v-if="replaySpeed">
                    {{ replaySpeedLabels[replaySpeed] || replaySpeed + 'x' }}
                  </span>
                </VFlex>
                <VFlex>
                  <VIcon
                    @click="play(2)"
                  >
                    fast_forward
                  </VIcon>
                </VFlex>
              </VLayout>
            </VContainer>
          </VFlex>

          <VFlex
            xs8
            lg6
            class="timelineSlider"
          >
            <VSlider
              v-model="timestamp"
              :min="minDate"
              :max="maxTime"
              :thumb-size="90"

              :step="1"
              always-dirty
              :class="{live: isLive}"
              append-icon="live_tv"
              @end="updateCompleteMap"
              @click:append="setLive"
            />
          </VFlex>
          <VFlex
            xs2
            lg4
            class="timelineInformation"
          >
            <VContainer>
              <VLayout
                row
                align-center
                justify-space-around
                wrap
              >
                <VFlex wrap>
                  {{ timestampText }}
                </VFlex>
                <VFlex
                  hidden-md-and-down
                >
                  <span
                    v-if="isLive"
                    class="live"
                  >
                    LIVE
                  </span>
                  <span v-else>
                    ({{ currentTimeOffsetText }} ago)
                  </span>
                </VFlex>

                <VFlex>
                  <VMenu offset-y>
                    <VTooltip
                      slot="activator"
                      left
                    >
                      <span>timespan</span>
                      <VBtn
                        slot="activator"
                        label="timespan"
                        color="secondary"
                      >
                        <span>{{ sliderSpanName }}</span>
                      </VBtn>
                    </VTooltip>
                    <VList>
                      <VListTile
                        v-for="(value, key) in sliderSpanSteps"
                        :key="key"
                        @click="setSliderSpan(key, value)"
                      >
                        <VListTileTitle>{{ key }}</VListTileTitle>
                      </VListTile>
                    </VList>
                  </VMenu>
                </VFlex>
              </VLayout>
            </VContainer>
          </VFlex>
        </Vlayout>
      </VContainer>
    </div>
    <!-- END Slider Navigation -->
  </div>
  <!-- END MAIN CONTENT-->
</template>

<script>
import moment from 'moment'
import 'moment-duration-format'
import { mapState } from 'vuex'
import { durationTemplate } from '@/js/timeUtil.js'
import ZoomableMap from '@/components/ZoomableMap.vue'
import ChunkBuffer from '@/js/chunkBuffer.js'
import RobotBuffer from '@/js/robotBuffer.js'
export default {
  name: 'Map',
  components: {
    ZoomableMap
  },
  props: {
    //
  },
  data: function () {
    return {
      timestamp: Date.now(), // timestamp now
      minDate: Date.now() - (1000 * 60 * 60), // one time set minDate for slider
      sliderSpanSteps: { '1 minute': 1000 * 60, '1 hour': 1000 * 60 * 60, '1 day': 1000 * 3600 * 24, '1 week': 1000 * 3600 * 24 * 7 },
      sliderSpanName: '1 hour',
      buffering: {
        map: false,
        chunks: false,
        robots: false
      },
      replaySpeed: 1, // slider replay speed in times the real time
      forwardSteps: [1, 2, 4, 8, 60, 3600, 86400],
      rewindSteps: [-1, -2, -4, -8, -60, -3600, -86400],
      replaySpeedLabels: { 60: '1min/s', 3600: '1h/s', 86400: '1d/s', '-60': '-1min/s', '-3600': '-1h/s', '-86400': '-1d/s' },
      lastTime: Date.now()
    }
  },
  computed: {
    metadata: function () {
      return this.$store.state.metadata
    },
    map: function () {
      return this.$store.state.map
    },
    isLive: function () {
      return this.currentTime - this.timestamp < 1500
    },
    isBuffering: function () {
      return this.buffering.map || this.buffering.chunks || this.buffering.robots
    },
    maxTime: function () {
      return this.currentTime
    },
    timestampText: function () {
      return this.getTimeText(this.timestamp)
    },
    currentTimeOffsetText: function () {
      return this.getTimeDifferenceText(this.timestamp, this.currentTime)
    },
    ...mapState([
      'currentTime'
    ])
  },
  watch: {
    // Update at each clock tick
    currentTime: function () {
      const now = Date.now()
      const lastTimeSpan = Math.max(0, now - this.lastTime)
      this.lastTime = now

      if (!this.isBuffering) {
        // do not exceed current time
        this.timestamp = Math.min(this.timestamp + (lastTimeSpan * this.replaySpeed), this.currentTime)
        // this.replaySpeed = this.isLive && this.replaySpeed > 1 ? 1 : this.replaySpeed      // To limit replay speed once live mode is reached
      }

      if (!this.isBuffering) {
        ChunkBuffer.update(this.timestamp, this.replaySpeed, 5, this.isLive)
        RobotBuffer.update(this.timestamp, this.replaySpeed, 5, this.isLive)
      }
    },
    isLive: function (newValue) {
      if (newValue && this.replaySpeed > 1) {
        this.replaySpeed = 1
      }
    }
  },
  mounted: function () {
    // start counting seconds
    this.$store.dispatch('autoUpdateCurrentTime')
    // Wait until entire view has been rendered
    // https://vuejs.org/v2/api/#mounted
    this.$nextTick(function () {
      // Code
    })
    ChunkBuffer.on('buffering', () => {
      console.log('chunks buffering')
      this.buffering.chunks = true
    })
    ChunkBuffer.on('done-buffering', () => {
      console.log('chunks done-buffering')
      this.buffering.chunks = false
    })
    RobotBuffer.on('buffering', () => {
      console.log('robot buffering')
      this.buffering.robots = true
    })
    RobotBuffer.on('done-buffering', () => {
      console.log('robot done-buffering')
      this.buffering.robots = false
    })
  },
  beforeMount: async function () {
    // Initialize metadata
    const chunkMeta = this.$store.state.metadata
    let wasSuccessful
    if (typeof chunkMeta === 'undefined') {
      wasSuccessful = await this.$store.dispatch('fetchMetadata')
      console.log(`Fetching metadata successful: ${wasSuccessful}`)
    }
    // Initialize map
    if (typeof map === 'undefined') {
      wasSuccessful = await this.$store.dispatch('fetchMap')
      console.log(`Fetching map successful: ${wasSuccessful}`)
    }
    // Initialize robots
    wasSuccessful = await this.$store.dispatch('fetchRobots')
    console.log(`Fetching robots successful: ${wasSuccessful}`)

    // TODO Initialize robot coordinates
  },
  methods: {
    updateCompleteMap: async function (timestamp) {
      this.buffering.map = true
      await this.$store.dispatch('fetchMap', { updatedBefore: timestamp })
      await this.$store.dispatch('fetchRobots', { updatedBefore: timestamp })
      this.buffering.map = false
    },
    // replay / pause / rewind / fast forward
    play: function (speed) {
      if (speed === 0) {
        this.replaySpeed = 0
        this.updateCompleteMap(this.timestamp)
      } else if (speed === 1 || (this.isLive && speed > 1)) {
        this.replaySpeed = 1
      } else if (speed < 0) {
        if (this.replaySpeed < 0) {
          // proceed rewind one speed step up, cycling back on overflow
          const nextIndex = (this.rewindSteps.indexOf(this.replaySpeed) + 1) % this.rewindSteps.length
          this.replaySpeed = this.rewindSteps[nextIndex]
        } else {
          // start rewind
          this.replaySpeed = speed
        }
      } else if (speed > 1) {
        if (this.replaySpeed > 0) {
          // proceed (fast) forward one speed step up, cycling back on overflow
          const nextIndex = (this.forwardSteps.indexOf(this.replaySpeed) + 1) % this.forwardSteps.length
          this.replaySpeed = this.forwardSteps[nextIndex]
        } else {
          // start forward
          this.replaySpeed = speed
        }
      } else {
        console.log(`Error, no handling found for play speed ${speed}`)
      }
    },
    setLive: function () {
      // one time set of the timestamp to the most recent current time
      // Time update handled in watch currentTime
      this.timestamp = this.currentTime
      this.replaySpeed = 1
      this.updateCompleteMap()
    },
    setSliderSpan: function (name, timeSpanBack) {
      // set slider minDate to <timeSpanBack> ago
      const updatedMinDate = this.currentTime - timeSpanBack
      // if (this.timestamp < updatedMinDate) {
      //   this.timestamp = updatedMinDate
      // }
      this.minDate = updatedMinDate
      this.sliderSpanName = name
    },

    getTimeText: function (numericTime) {
      // https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
      // var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(numericTime).toLocaleString('de-DE')
    },
    // Return (positive) time difference later - earlier
    getTimeDifferenceText: function (numericTimeEarlier, numericTimeLater) {
      // https://github.com/jsmreese/moment-duration-format#basics
      return moment.duration(moment(numericTimeLater).diff(moment(numericTimeEarlier))).format(durationTemplate)
    },
    daysAgo: function (numberOfDays) {
      const date = new Date()
      date.setDate(date.getDate() - numberOfDays)
      return date.getTime()
    }

  }

}

</script>

<style>
.live, .live .v-icon {
  /* #color: var(--v-primary); */
  color: #ed4455 !important
}
</style>
<style scoped lang="scss">
.timelineNavigation * {
  user-select: none;
}
.layout {
  width: 100% !important;
}
.bottom-fixed {
  position: fixed;
  bottom:0%;
  width:100%;
  box-shadow: 10px 10px 8px 10px #888888;
  z-index: 300;
  opacity: 1 !important;
  padding-left: 15px;
  padding-right: 15px;
  //background: rgba(248,248,248,1);
}
.bottom-fixed * {
  opacity: 1 !important;
}
.bottom-fixed .container {
  padding-top: 0px !important;
  padding-bottom: 0px !important;
}
</style>
