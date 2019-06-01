import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: require('@/view/home/home.vue').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
