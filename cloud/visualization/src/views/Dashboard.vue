<template>
  <div class="page-wrapper">
    <!-- HEADER MOBILE-->
    <header class="header-mobile d-block d-lg-none">
      <div class="header-mobile__bar">
        <div class="container-fluid">
          <div class="header-mobile-inner">
            <a
              class="logo"
              href="/"
            >
              <img
                src="../images/icon/logo.png"
                alt="CoolAdmin"
              >
            </a>
            <button
              class="hamburger hamburger--slider"
              type="button"
            >
              <span class="hamburger-box">
                <span class="hamburger-inner" />
              </span>
            </button>
          </div>
        </div>
      </div>
      <nav class="navbar-mobile">
        <div class="container-fluid">
          <ul class="navbar-mobile__list list-unstyled">
            <li>
              <a href="/dashboard">
                <i class="fas fa-tachometer-alt" />Dashboard
              </a>
            </li>
            <li>
              <a href="map">
                <i class="fas fa-map-marker-alt" />Map
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
    <!-- END HEADER MOBILE-->

    <!-- MENU SIDEBAR-->
    <aside class="menu-sidebar d-none d-lg-block">
      <div class="logo">
        <a href="#">
          <img
            src="../images/icon/logo.png"
            alt="Cool Admin"
          >
        </a>
      </div>
      <div class="menu-sidebar__content js-scrollbar1">
        <nav class="navbar-sidebar">
          <ul class="list-unstyled navbar__list">
            <li>
              <a href="/dashboard">
                <i class="fas fa-tachometer-alt" />Dashboard
              </a>
            </li>
            <li>
              <a href="map">
                <i class="fas fa-map-marker-alt" />Map
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
    <!-- END MENU SIDEBAR-->

    <!-- PAGE CONTAINER-->
    <div class="page-container">
      <!-- HEADER DESKTOP-->
      <header class="header-desktop">
        <div class="section__content section__content--p30">
          <div class="container-fluid">
            <div class="header-wrap">
              <form
                class="form-header"
                action=""
                method="POST"
              >
                <input
                  class="au-input au-input--xl"
                  type="text"
                  name="search"
                  placeholder="Search for datas &amp; reports..."
                >
                <button
                  class="au-btn--submit"
                  type="submit"
                >
                  <i class="zmdi zmdi-search" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>
      <!-- HEADER DESKTOP-->

      <!-- MAIN CONTENT-->
      <div class="main-content">
        <div class="section__content section__content--p30">
          <div class="container-fluid">
            <div class="row">
              <div class="col-md-12">
                <div class="overview-wrap">
                  <h2 class="title-1">
                    system overview
                  </h2>
                </div>
              </div>
            </div>
            <div class="row m-t-25">
              <div class="col-sm-6 col-lg-3">
                <div class="overview-item overview-item--c1">
                  <div class="overview__inner">
                    <div class="overview-box clearfix">
                      <div class="text">
                        <div class="robots-connected">
                          <div id="noOfRobots" />
                        </div>
                        <span>robots connected</span>
                      </div>
                    </div>
                    <div class="chart overview-chart">
                      <!-- <canvas id="widgetChart1" /> -->
                      <Chart
                        chart-type="line"
                        :labels="['January', 'February', 'March', 'April', 'May', 'June', 'July']"
                        :datasets="datasets['widgetChart1']"
                        :options="options['widgetChart1']"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-sm-6 col-lg-3">
                <div class="overview-item overview-item--c2">
                  <div class="overview__inner">
                    <div class="overview-box clearfix">
                      <div class="text">
                        <div class="msgs-second">
                          <div id="messagePerSec" />
                        </div>
                        <span>messages per second</span>
                      </div>
                    </div>
                    <div class="chart overview-chart">
                      <!-- <canvas id="widgetChart2" /> -->
                      <Chart
                        chart-type="line"
                        :labels="['January', 'February', 'March', 'April', 'May', 'June']"
                        :datasets="datasets['widgetChart2']"
                        :options="options['widgetChart2']"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-sm-6 col-lg-3">
                <div class="overview-item overview-item--c3">
                  <div class="overview__inner">
                    <div class="overview-box clearfix">
                      <div class="text">
                        <div class="msgs-second">
                          <div id="mapTiles" />
                        </div>
                        <span>New map tiles received</span>
                      </div>
                    </div>
                    <div class="chart overview-chart">
                      <!-- <canvas id="widgetChart3" /> -->
                      <Chart
                        chart-type="line"
                        :labels="['January', 'February', 'March', 'April', 'May', 'June']"
                        :datasets="datasets['widgetChart3']"
                        :options="options['widgetChart3']"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-sm-6 col-lg-3">
                <div class="overview-item overview-item--c4">
                  <div class="overview__inner">
                    <div class="overview-box clearfix">
                      <div class="text">
                        <div id="totalMessages" />
                        <span>Traffic per minute</span>
                      </div>
                    </div>
                    <div class="chart overview-chart">
                      <!-- <canvas id="widgetChart4" /> -->
                      <Chart
                        chart-type="bar"
                        :labels="['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']"
                        :datasets="datasets['widgetChart4']"
                        :options="options['widgetChart4']"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-lg-6">
                <div class="au-card recent-report">
                  <div class="au-card-inner">
                    <h3 class="title-2">
                      Robots connected
                    </h3>
                    <div class="chart-info">
                      <div class="chart-info__left">
                        <div class="chart-note">
                          <br>
                          <span class="dot dot--blue" />
                          <span>robots</span>
                        </div>
                      </div>
                    </div>
                    <div class="chart recent-report__chart">
                      <!-- <canvas id="recent-rep-chart" /> -->
                      <Chart
                        chart-type="line"
                        :labels="['May', 'June', 'July', '']"
                        :datasets="datasets['recentRepChart']"
                        :options="options['recentRepChart']"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-lg-6">
                <div class="au-card chart-percent-card">
                  <div class="au-card-inner">
                    <h3 class="title-2 tm-b-5">
                      Active robots
                    </h3>
                    <div class="row no-gutters">
                      <div class="col-xl-6">
                        <div class="chart-note-wrap">
                          <div class="chart-note mr-0 d-block">
                            <span class="dot dot--blue" />
                            <span>Moving robots</span>
                          </div>
                          <div class="chart-note mr-0 d-block">
                            <span class="dot dot--red" />
                            <span>Resting robots</span>
                          </div>
                        </div>
                      </div>
                      <div class="col-xl-6">
                        <div class="chart percent-chart">
                          <!-- <canvas id="percent-chart" /> -->
                          <Chart
                            chart-type="doughnut"
                            :labels="[
                              'Moving Robots',
                              'Resting Robots'
                            ]"
                            :datasets="datasets['percentChart']"
                            :options="options['percentChart']"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- END MAIN CONTENT-->
      <!-- END PAGE CONTAINER-->
    </div>
  </div>
</template>

<!-- Custom JS-->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.min.js" type="text/javascript"></script>

<!-- Bootstrap JS-->
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
<!-- Vendor JS-->
<script src="../vendor/animsition/animsition.min.js"></script>
<script src="../vendor/chartjs/Chart.bundle.min.js"></script>
<!-- Main JS-->
<script src="../js/main.js"></script>
<script src="../js/mqtt_client_frontend.js" type="text/javascript"></script>

<script>
import Chart from '@/components/Chart.vue'
import { datasets } from '@/data/chartDatasets.js'
import { options } from '@/data/chartOptions.js'

export default {
  name: 'Dashboard',
  components: {
    Chart
  },
  data () {
    return {
      datasets: datasets,
      options: options
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "../css/font-face.css";
@import "../vendor/animsition/animsition.min.css";
@import "../css/theme.css";
@import url("https://use.fontawesome.com/releases/v5.2.0/css/all.css");
@import url("https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css");
@import url("https://cdnjs.cloudflare.com/ajax/libs/material-design-iconic-font/2.2.0/css/material-design-iconic-font.min.css");
</style>
