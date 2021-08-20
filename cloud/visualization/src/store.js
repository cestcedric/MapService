import Vue from 'vue'
import Vuex from 'vuex'

// import { toChunkRowColumn } from '@/js/stateUtil.js'
import { getLatestMap, getChunkMeta } from '@/js/restUtilChunks.js'
import { getLatestRobots } from '@/js/restUtilRobot.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // Three-level chunk object mapping: chunkRowColumn -> timestamp -> chunkData
    // Idea: First fetch only chunkRowColumn and timestamp for all chunkRowColumns within the relevant timeframe (no image data). Update on mqtt notification.
    // Dynamically fetch pngBase64 image data when a specific chunk is requested.
    currentTime: Date.now(),
    frameRate: 5,
    metadata: undefined,
    map: undefined,
    robots: {},
    chunks: {},
    emptyChunk: {} // TODO empty image chunk element
  },
  mutations: {
    /*  https://vuex.vuejs.org/guide/mutations.html
     *  When adding new properties to an Object:
     *    * Use Vue.set(obj, 'newProp', 123)
     *  Mutation handler functions must be synchronous!
     */
    // Set current time millis, auto-updated by action
    setCurrentTime (state) {
      // Check for required payload attributes, must exist and be truthy
      state.currentTime = Date.now()
    },
    saveFrameRate (state, payload) {
      // Check for required payload attributes, must exist and be truthy
      state.frameRate = payload.frameRate
    },
    // Persist chunk metadata to the 'metadata' state variable
    saveMetadata (state, payload) {
      // Check for required payload attributes, must exist and be truthy
      if (payload.metadata) {
        // Write only if metadata does not already exists
        if (typeof state.metadata === 'undefined') {
          console.log(`Store save metadata ${JSON.stringify(payload.metadata)}`)
          Vue.set(state, 'metadata', payload.metadata)
        } else {
          console.log(`Trying to overwrite existing metadata ${JSON.stringify(state.metadata)} with payload.metadata ${JSON.stringify(payload.metadata)}, do nothing.`)
        }
      } else {
        console.log(`Missing payload properties: payload.metadata ${payload.metadata}.`)
      }
    },
    saveMap (state, payload) {
      // Check for required payload attributes, must exist and be truthy
      if (payload.map) {
        console.log(`Store save map of length ${Object.keys(payload.map).length * Object.keys(payload.map['0']).length}`)
        Vue.set(state, 'map', payload.map)
      } else {
        console.log(`Missing payload properties: payload.map ${payload.map}.`)
      }
    },
    // Persist chunk data to the 'chunks' state variable
    saveChunk (state, payload) {
      // Check for required payload attributes, must exist and be truthy
      if (payload.row != null && payload.column != null && payload.timestamp != null && payload.chunkData) {
        if (typeof state.chunks[payload.row] === 'undefined') {
          Vue.set(state.chunks, payload.row, {})
        }
        // if (typeof state.chunks[payload.row][payload.column] === 'undefined') {
        //   Vue.set(state.chunks[payload.row], payload.column, {})
        // }
        // TODO Timestamp
        if (typeof state.chunks[payload.row][payload.column] === 'undefined') {
          Vue.set(state.chunks[payload.row], payload.column, payload.chunkData)
        } else {
          console.log(`Trying to overwrite existing chunkData ${state.chunks[payload.row][payload.column]} with payload.row ${payload.row}, payload.column ${payload.column}, payload.timestamp ${payload.timestamp}, payload.chunkData ${payload.chunkData}, do nothing.`)
        }

        // TODO Timestamp
        // Write only if chunkData does not already exists
        // if (typeof state.chunks[payload.chunkRow][payload.chunkColumn][payload.timestamp] === 'undefined') {
        //   Vue.set(state.chunks[payload.chunkRow][payload.chunkColumn], payload.timestamp, payload.chunkData)
        // } else {
        //   console.log(`Trying to overwrite existing chunkData payload.chunkRowColumn ${payload.chunkRowColumn}, payload.timestamp ${payload.timestamp}, do nothing.`)
        // }
      } else {
        console.log(`Missing payload properties: payload.chunkRow ${payload.row}, payload.chunkColumn ${payload.column}, payload.timestamp ${payload.timestamp}, payload.chunkData ${payload.chunkData}.`)
      }
    },
    saveRobots (state, payload) {
      // console.log(`save robots ${JSON.stringify(payload.robots)}`)
      if (!payload.robots) {
        Vue.set(state.robots, {})
        return
      }
      console.log(`save robots ${JSON.stringify(payload.robots)}`)
      Vue.set(state, 'robots', payload.robots)
    }
  },
  actions: {
    /*  https://vuex.vuejs.org/guide/actions.html
     *  Actions can contain arbitrary asynchronous operations.
     */

    autoUpdateCurrentTime (context, payload) {
      let fr = context.state.frameRate

      if (payload) {
        fr = payload.frameRate || fr
      }

      if (this.intervalId !== null) {
        clearInterval(this.intervalID)
      }

      context.commit({
        type: 'saveFrameRate',
        frameRate: fr
      })
      console.log('Time update interval with frame rate: ' + fr + ` (${1000 / fr}ms)`)
      this.intervalId = setInterval(() => context.commit('setCurrentTime'), 1000 / fr)
    },
    async fetchMetadata (context) {
      try {
        const chunkMetadata = await getChunkMeta()
        if (chunkMetadata != null) {
          console.log(`Store commit metadata ${JSON.stringify(chunkMetadata)}.`)
          context.commit({
            type: 'saveMetadata',
            metadata: chunkMetadata
          })
          return true
        } else {
          console.log(`Could not resolve metadata: ${JSON.stringify(chunkMetadata)}`)
          return false
        }
      } catch (error) {
        console.log(`Failed to fetch chunk metadata: ${error}`)
        return false
      }
    },
    async fetchMap (context, payload) {
      try {
        if (!context.state.metadata) {
          console.log('Metadata has to be initialized first before fetchMap!')
          return false
        } else {
          let updatedBefore
          if (payload) {
            updatedBefore = payload.updatedBefore
          }
          const map = await getLatestMap(context.state.metadata, updatedBefore)
          if (map != null) {
            console.log(`Store commit map with ${Object.keys(map).length * Object.keys(map['0']).length} elemnts.`)
            context.commit({
              type: 'saveMap',
              map: map
            })
          } else {
            console.log(`Could not resolve map: ${JSON.stringify(map)}`)
          }
          return true
        }
      } catch (error) {
        console.log(`Failed to fetch map: ${error}`)
        return false
      }
    },
    async fetchRobots (context, payload) {
      try {
        let updatedBefore
        if (payload) {
          updatedBefore = payload.updatedBefore
        }
        const robots = await getLatestRobots(updatedBefore)
        if (robots != null) {
          context.commit({
            type: 'saveRobots',
            robots: robots
          })
        }
        return true
      } catch (error) {
        console.log(`Failed to fetch robots: ${error}`)
        return false
      }
    },
    /* async fetchAllChunkData (context) {
      try {
        const chunkDataList = await getChunkList()
        if (chunkDataList != null) {
          for (const chunkDat of chunkDataList) {
            context.commit({
              type: 'saveChunk',
              row: chunkDat.row,
              column: chunkDat.column,
              timestamp: chunkDat.timestamp,
              chunkData: chunkDat
            })
          }
          return true
        } else {
          console.log(`Could not resolve chunkDataList: ${chunkDataList}`)
          return false
        }
      } catch (error) {
        console.log(`Failed to fetch chunkDataList: ${error}`)
        return false
      }
    }, */
    /* fetchChunkData (context, payload) {
      try {
        const chunkData = getChunkData(payload.uniqueID)
        // TODO check consistency with requested data (on develop)
        if (chunkData !== null && typeof chunkData !== 'undefined') {
          context.commit({
            type: 'saveChunk',
            row: chunkData.row,
            column: chunkData.column,
            timestamp: chunkData.timestamp,
            chunkData: chunkData
          })
        }
      } catch (error) {
        console.log(`Failed to fetch chunk for payload.chunkRowColumn ${payload.chunkRowColumn}, payload.timestamp ${payload.timestamp}: ${error}`)
      }
    }, */
    setFrameRate (context, payload) {
      context.commit({
        type: 'saveFrameRate',
        frameRate: payload.frameRate
      })
    }
  },
  getters: {
    /* For derived state (no async actions) */

    // return sorted list of timestamps for a specified chunkRowColumn
    // TODO check for correct sorting of datetime strings
    getSortedTimestampList: (state) => (chunkRowColumn) => {
      if (typeof state.chunks[chunkRowColumn] === 'undefined') {
        // console.log(`Trying to getSortedTimestampList from undefined chunkRowColumn ${chunkRowColumn}, return empty.`)
        return []
      }
      const timestampKeys = Object.keys(state.chunks[chunkRowColumn])
      return timestampKeys.sort()
    },
    // https://vuex.vuejs.org/guide/getters.html#method-style-access
    // return the chunk data by it's chunkRowColumn (position in map image) and timestamp
    getChunkData: (state) => (chunkRow, chunkColumn, timestamp = -1) => {
      if (state.map == null || state.map[chunkRow] == null || state.map[chunkRow][chunkColumn] == null) {
        // TODO check also for Timestamp when implemented state.map[chunkRow][chunkColumn][timestamp]
        // chunks have to be initialized first
        console.log(`Error: could not find chunk for rowColumn ${chunkRow}, column ${chunkColumn} timestamp ${timestamp}.`)
        return null
      }
      // [timestamp]
      const chunkData = state.map[chunkRow][chunkColumn]
      return chunkData
    }
  }
})
