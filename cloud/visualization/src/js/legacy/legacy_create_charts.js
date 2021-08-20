
import jQuery from 'jquery'
import Chart from 'chart.js'
// import animsition from 'animsition'
// import progressbar from 'progressbar'
// bootstrap
// popper

// Recent Report: robots connected
const brandProduct = 'rgba(0,181,233,0.8)'
// const brandService = 'rgba(0,173,95,0.8)'

// var elements = 10

export var myChartRobots
export var myChartPie
export var myChart1
export var myChart2
export var myChart3
export var myChart4

var ctxRep = document.getElementById('recent-rep-chart')
if (ctxRep) {
  ctxRep.height = 250
  myChartRobots = new Chart(ctxRep, {
    type: 'line',
    data: {
      labels: ['May', 'June', 'July', ''],
      datasets: [
        {
          label: 'My Second dataset',
          backgroundColor: brandProduct,
          borderColor: 'transparent',
          pointHoverBackgroundColor: '#fff',
          borderWidth: 0,
          data: [1, 2, 5, 0]

        }
      ]
    },
    options: {
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

    }
  })
}

// Percent Chart
var ctxPercent = document.getElementById('percent-chart')
if (ctxPercent) {
  ctxPercent.height = 280
  myChartPie = new Chart(ctxPercent, {
    type: 'doughnut',
    data: {
      datasets: [
        {
          label: 'My First dataset',
          data: [0, 100],
          backgroundColor: [
            '#00b5e9',
            '#fa4251'
          ],
          hoverBackgroundColor: [
            '#00b5e9',
            '#fa4251'
          ],
          borderWidth: [
            0, 0
          ],
          hoverBorderColor: [
            'transparent',
            'transparent'
          ]
        }
      ],
      labels: [
        'Moving Robots',
        'Resting Robots'
      ]
    },
    options: {
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
    }
  })
}

(function ($) {
  // USE STRICT
  'use strict'

  try {
    // WidgetChart
    var ctx1 = document.getElementById('widgetChart1')
    if (ctx1) {
      ctx1.height = 130
      myChart1 = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
          type: 'line',
          datasets: [{
            data: [78, 81, 80, 45, 34, 12, 40],
            label: 'Dataset',
            backgroundColor: 'rgba(255,255,255,.1)',
            borderColor: 'rgba(255,255,255,.55)'
          } ]
        },
        options: {
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
        }
      })
    }

    // WidgetChart 2
    var ctx2 = document.getElementById('widgetChart2')
    if (ctx2) {
      ctx2.height = 130
      myChart2 = new Chart(ctx2, {
        type: 'line',
        data: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June'],
          type: 'line',
          datasets: [{
            data: [1, 18, 9, 17, 34, 22],
            label: 'Dataset',
            backgroundColor: 'transparent',
            borderColor: 'rgba(255,255,255,.55)'
          } ]
        },
        options: {

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
        }
      })
    }

    // WidgetChart 3
    var ctx3 = document.getElementById('widgetChart3')
    if (ctx3) {
      ctx3.height = 130
      myChart3 = new Chart(ctx3, {
        type: 'line',
        data: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June'],
          type: 'line',
          datasets: [{
            data: [65, 59, 84, 84, 51, 55],
            label: 'Dataset',
            backgroundColor: 'transparent',
            borderColor: 'rgba(255,255,255,.55)'
          } ]
        },
        options: {

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
        }
      })
    }

    // WidgetChart 4
    var ctx4 = document.getElementById('widgetChart4')
    if (ctx4) {
      ctx4.height = 115
      myChart4 = new Chart(ctx4, {
        type: 'bar',
        data: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
          datasets: [
            {
              label: 'My First dataset',
              data: [78, 81, 80, 65, 58, 75, 60, 75, 65, 60, 60, 75],
              borderColor: 'transparent',
              borderWidth: '0',
              backgroundColor: 'rgba(255,255,255,.3)'
            }
          ]
        },
        options: {
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
      })
    }
  } catch (error) {
    console.log(error)
  }
})(jQuery);

(function ($) {
  // USE STRICT
  'use strict'
  $('.animsition').animsition({
    inClass: 'fade-in',
    outClass: 'fade-out',
    inDuration: 900,
    outDuration: 900,
    linkElement: 'a:not([target="_blank"]):not([href^="#"]):not([class^="chosen-single"])',
    loading: true,
    loadingParentElement: 'html',
    loadingClass: 'page-loader',
    loadingInner: '<div class="page-loader__spin"></div>',
    timeout: false,
    timeoutCountdown: 5000,
    onLoadEvent: true,
    browser: ['animation-duration', '-webkit-animation-duration'],
    overlay: false,
    overlayClass: 'animsition-overlay-slide',
    overlayParentElement: 'html',
    transition: function (url) {
      window.location.href = url
    }
  })
})(jQuery);
(function ($) {
  // Use Strict
  'use strict'
  try {
    var progressbarSimple = $('.js-progressbar-simple')
    progressbarSimple.each(function () {
      var that = $(this)
      var executed = false
      $(window).on('load', function () {
        that.waypoint(function () {
          if (!executed) {
            executed = true
            /* progress bar */
            that.progressbar({
              update: function (currentPercentage, $this) {
                $this.find('.js-value').html(currentPercentage + '%')
              }
            })
          }
        }, {
          offset: 'bottom-in-view'
        })
      })
    })
  } catch (err) {
    console.log(err)
  }
})(jQuery);
(function ($) {
  // USE STRICT
  'use strict'
})(jQuery);
(function ($) {
  // USE STRICT
  'use strict'

  // Select 2
  try {
    $('.js-select2').each(function () {
      $(this).select2({
        minimumResultsForSearch: 20,
        dropdownParent: $(this).next('.dropDownSelect2')
      })
    })
  } catch (error) {
    console.log(error)
  }
})(jQuery);
(function ($) {
  // USE STRICT
  'use strict'

  // Dropdown
  try {
    var menu = $('.js-item-menu')
    var subMenuIsShowed = -1

    for (var i = 0; i < menu.length; i++) {
      $(menu[i]).on('click', function (e) {
        e.preventDefault()
        $('.js-right-sidebar').removeClass('show-sidebar')
        if (jQuery.inArray(this, menu) === subMenuIsShowed) {
          $(this).toggleClass('show-dropdown')
          subMenuIsShowed = -1
        } else {
          for (var i = 0; i < menu.length; i++) {
            $(menu[i]).removeClass('show-dropdown')
          }
          $(this).toggleClass('show-dropdown')
          subMenuIsShowed = jQuery.inArray(this, menu)
        }
      })
    }
    $('.js-item-menu, .js-dropdown').click(function (event) {
      event.stopPropagation()
    })

    $('body,html').on('click', function () {
      for (var i = 0; i < menu.length; i++) {
        menu[i].classList.remove('show-dropdown')
      }
      subMenuIsShowed = -1
    })
  } catch (error) {
    console.log(error)
  }

  // var wW = $(window).width()
  // Right Sidebar
  var rightSidebar = $('.js-right-sidebar')
  var sidebarBtn = $('.js-sidebar-btn')

  sidebarBtn.on('click', function (e) {
    e.preventDefault()
    for (var i = 0; i < menu.length; i++) {
      menu[i].classList.remove('show-dropdown')
    }
    subMenuIsShowed = -1
    rightSidebar.toggleClass('show-sidebar')
  })

  $('.js-right-sidebar, .js-sidebar-btn').click(function (event) {
    event.stopPropagation()
  })

  $('body,html').on('click', function () {
    rightSidebar.removeClass('show-sidebar')
  })

  // Sublist Sidebar
  try {
    var arrow = $('.js-arrow')
    arrow.each(function () {
      var that = $(this)
      that.on('click', function (e) {
        e.preventDefault()
        that.find('.arrow').toggleClass('up')
        that.toggleClass('open')
        that.parent().find('.js-sub-list').slideToggle('250')
      })
    })
  } catch (error) {
    console.log(error)
  }

  try {
    // Hamburger Menu
    $('.hamburger').on('click', function () {
      $(this).toggleClass('is-active')
      $('.navbar-mobile').slideToggle('500')
    })
    $('.navbar-mobile__list li.has-dropdown > a').on('click', function () {
      var dropdown = $(this).siblings('ul.navbar-mobile__dropdown')
      $(this).toggleClass('active')
      $(dropdown).slideToggle('500')
      return false
    })
  } catch (error) {
    console.log(error)
  }
})(jQuery);
(function ($) {
  // USE STRICT
  'use strict'

  // Load more
  try {
    var listLoad = $('.js-list-load')
    if (listLoad[0]) {
      listLoad.each(function () {
        var that = $(this)
        that.find('.js-load-item').hide()
        var loadBtn = that.find('.js-load-btn')
        loadBtn.on('click', function (e) {
          $(this).text('Loading...').delay(1500).queue(function (next) {
            $(this).hide()
            that.find('.js-load-item').fadeToggle('slow', 'swing')
          })
          e.preventDefault()
        })
      })
    }
  } catch (error) {
    console.log(error)
  }
})(jQuery);
(function ($) {
  // USE STRICT
  'use strict'

  try {
    $('[data-toggle="tooltip"]').tooltip()
  } catch (error) {
    console.log(error)
  }

  // Chatbox
  try {
    // var inboxWrap = $('.js-inbox')
    var message = $('.au-message__item')
    message.each(function () {
      var that = $(this)

      that.on('click', function () {
        $(this).parent().parent().parent().toggleClass('show-chat-box')
      })
    })
  } catch (error) {
    console.log(error)
  }
})(jQuery);
(function ($) {
  // USE STRICT
  'use strict'

  try {
    document.getElementById('noOfRobots').innerHTML = '<h2>0</h2>'
    document.getElementById('messagePerSec').innerHTML = '<h2>0</h2>'
    document.getElementById('mapTiles').innerHTML = '<h2>0</h2>'
    document.getElementById('totalMessages').innerHTML = '<h2>0</h2>'
  } catch (error) {
    console.log(error)
  }
})(jQuery)
