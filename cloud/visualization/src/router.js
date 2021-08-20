import Vue from 'vue'
import Router from 'vue-router'
import Dashboard from './views/Dashboard.vue'
import Map from './views/Map.vue'
import Controller from './views/Controller.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    // {
    //   path: '/',
    //   redirect: '/map'
    // },
    {
      // path: '/map',
      path: '/',
      name: 'map',
      component: Map
    },
    {
      // path: '/map',
      path: '/controller',
      name: 'controller',
      component: Controller
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard
    }
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    // }
  ]
})
