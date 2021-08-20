<template>
  <!-- MAIN CONTENT-->
  <div style="text-align:center;width:300px;margin:auto;">
    <VFlex
      xs12
    >
      <VTextField
        v-model="robotName"
        label="Give your robot a name"
      />
    </VFlex>

    <VFlex
      v-if="!disabled"
      xs12
    >
      Move your robot
    </VFlex>

    <VFlex xs12>
      <VBtn
        :disabled="disabled"
        @click="moveUp"
      >
        UP
      </VBtn><br><br>
      <VBtn
        :disabled="disabled"
        @click="moveLeft"
      >
        LEFT
      </VBtn>
      <VBtn
        :disabled="disabled"
        @click="moveRight"
      >
        RIGHT
      </VBtn><br><br>
      <VBtn
        :disabled="disabled"
        @click="moveDown"
      >
        DOWN
      </VBtn><br><br>
    </VFlex>
    <VFlex
      v-if="!disabled"
      xs12
    >
      Send a chunk
    </VFlex>
    <VFlex
      xs12
    >
      <VBtn
        color="black"
        dark
        :disabled="disabled"
        @click="emitBlack"
      >
        Black
      </VBtn>
      <VBtn
        color="grey"
        dark
        :disabled="disabled"
        @click="emitGrey"
      >
        Gray
      </VBtn>
      <VBtn
        color="white"
        class="black--text"
        dark
        :disabled="disabled"
        @click="emitWhite"
      >
        White
      </VBtn>
    </VFlex>
  </div>
</template>

<script>
import { mqttUtil } from '@/js/mqttUtilController.js'

export default {
  name: 'Controller',
  components: {
  },
  props: {
    //
  },
  data: function () {
    return {
      robotName: '',
      position: {
        x: 2450,
        y: 1650
      }
    }
  },
  computed: {
    disabled: function () {
      return this.robotName.length < 4
    }
  },
  watch: {
    robotName: function (name) {
    }
  },
  mounted: function () {
  },
  methods: {
    moveUp: function () {
      if (this.position.y > 100) {
        this.position.y -= 100
        mqttUtil.emitCoordinate(this.robotName, this.position.x, this.position.y, 'up')
      }
    },
    moveLeft: function () {
      if (this.position.x > 100) {
        this.position.x -= 100
        mqttUtil.emitCoordinate(this.robotName, this.position.x, this.position.y, 'left')
      }
    },
    moveDown: function () {
      if (this.position.y < 3100) {
        this.position.y += 100
        mqttUtil.emitCoordinate(this.robotName, this.position.x, this.position.y, 'down')
      }
    },
    moveRight: function () {
      if (this.position.x < 4700) {
        this.position.x += 100
        mqttUtil.emitCoordinate(this.robotName, this.position.x, this.position.y, 'right')
      }
    },
    emitBlack: function () {
      mqttUtil.emitChunk(this.robotName, this.position.x, this.position.y, 'black')
    },
    emitGrey: function () {
      mqttUtil.emitChunk(this.robotName, this.position.x, this.position.y, 'grey')
    },
    emitWhite: function () {
      mqttUtil.emitChunk(this.robotName, this.position.x, this.position.y, 'white')
    }
  }
}

</script>

<style>

</style>
