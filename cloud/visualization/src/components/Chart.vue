<!-- https://vuejsexamples.com/vue-chart-component-example-with-chart-js/ -->
<!-- https://github.com/risan/vue-chart-example/ -->
<template>
  <canvas
    ref="chartCanvas"
    :width="width"
    :height="height"
  />
</template>

<script>
import Chart from 'chart.js'
export default {
  name: 'Chart',
  props: {
    title: {
      type: String,
      default: 'myChart'
    },
    // The canvas's width.
    width: {
      type: Number,
      default: null,
      validator: value => value > 0
    },
    // The canvas's height.
    height: {
      type: Number,
      default: null,
      validator: value => value > 0
    },
    chartType: {
      type: String,
      default: 'line'
      // validator: value => value > 0 // TODO only allow valid Chart.js chart types
    },
    // The chart's data.labels
    labels: {
      type: Array,
      default: value => []
    },
    // The chart's data.datasets
    datasets: {
      type: Array,
      default: value => [],
      required: true
    },
    // The chart's options.
    options: {
      type: Object,
      default: value => ({})
    }
  },
  data () {
    return {
      chart: null
    }
  },
  watch: {
    datasets (newDatasets) {
      // Replace the datasets and call the update() method on Chart.js
      // instance to re-render the chart.
      this.chart.data.datasets = newDatasets
      this.chart.update()
    }
  },
  mounted () {
    this.chart = new Chart(this.$refs.chartCanvas, {
      type: this.chartType,
      data: {
        labels: this.labels,
        datasets: this.datasets
      },
      options: this.options
    })
  },
  beforeDestroy () {
    // Don't forget to destroy the Chart.js instance.
    if (this.chart) {
      this.chart.destroy()
    }
  }
}
</script>
