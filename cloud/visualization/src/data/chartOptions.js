export const options = {

  recentRepChart: {
    maintainAspectRatio: true,
    legend: {
      display: false
    },
    responsive: true,
    scales: {
      xAxes: [{
        gridLines: {
          drawOnChartArea: true,
          color: '#f2f2f2'
        },
        ticks: {
          fontFamily: 'Poppins',
          fontSize: 12
        }
      }],
      yAxes: [{
        ticks: {
          beginAtZero: true,
          maxTicksLimit: 5,
          stepSize: 1,
          max: 10,
          fontFamily: 'Poppins',
          fontSize: 12
        },
        gridLines: {
          display: true,
          color: '#f2f2f2'

        }
      }]
    },
    elements: {
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 4,
        hoverBorderWidth: 3
      }
    }
  },
  percentChart: {
    maintainAspectRatio: false,
    responsive: true,
    cutoutPercentage: 55,
    animation: {
      animateScale: true,
      animateRotate: true
    },
    legend: {
      display: false
    },
    tooltips: {
      titleFontFamily: 'Poppins',
      xPadding: 15,
      yPadding: 10,
      caretPadding: 0,
      bodyFontSize: 16
    }
  },
  widgetChart1: {
    maintainAspectRatio: true,
    legend: {
      display: false
    },
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }
    },
    responsive: true,
    scales: {
      xAxes: [{
        gridLines: {
          color: 'transparent',
          zeroLineColor: 'transparent'
        },
        ticks: {
          fontSize: 2,
          fontColor: 'transparent'
        }
      }],
      yAxes: [{
        display: false,
        ticks: {
          display: false
        }
      }]
    },
    title: {
      display: false
    },
    elements: {
      line: {
        borderWidth: 0
      },
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 4
      }
    }
  },
  widgetChart2: {

    maintainAspectRatio: false,
    legend: {
      display: false
    },
    responsive: true,
    tooltips: {
      mode: 'index',
      titleFontSize: 12,
      titleFontColor: '#000',
      bodyFontColor: '#000',
      backgroundColor: '#fff',
      titleFontFamily: 'Montserrat',
      bodyFontFamily: 'Montserrat',
      cornerRadius: 3,
      intersect: false
    },
    scales: {
      xAxes: [{
        gridLines: {
          color: 'transparent',
          zeroLineColor: 'transparent'
        },
        ticks: {
          fontSize: 2,
          fontColor: 'transparent'
        }
      }],
      yAxes: [{
        display: false,
        ticks: {
          display: false
        }
      }]
    },
    title: {
      display: false
    },
    elements: {
      line: {
        tension: 0.00001,
        borderWidth: 1
      },
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 4
      }
    }
  },
  widgetChart3: {

    maintainAspectRatio: false,
    legend: {
      display: false
    },
    responsive: true,
    tooltips: {
      mode: 'index',
      titleFontSize: 12,
      titleFontColor: '#000',
      bodyFontColor: '#000',
      backgroundColor: '#fff',
      titleFontFamily: 'Montserrat',
      bodyFontFamily: 'Montserrat',
      cornerRadius: 3,
      intersect: false
    },
    scales: {
      xAxes: [{
        gridLines: {
          color: 'transparent',
          zeroLineColor: 'transparent'
        },
        ticks: {
          fontSize: 2,
          fontColor: 'transparent'
        }
      }],
      yAxes: [{
        display: false,
        ticks: {
          display: false
        }
      }]
    },
    title: {
      display: false
    },
    elements: {
      line: {
        borderWidth: 1
      },
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 4
      }
    }
  },
  widgetChart4: {
    maintainAspectRatio: true,
    legend: {
      display: false
    },
    scales: {
      xAxes: [{
        display: false,
        categoryPercentage: 1,
        barPercentage: 0.65
      }],
      yAxes: [{
        display: false
      }]
    }
  }

}
