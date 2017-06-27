import Vue from 'vue'
import VueRouter from 'vue-router'
import globalStore from './components/globalStore'

Vue.use(VueRouter)

function load (component) {
  return () => System.import(`components/${component}.vue`)
}

function defaultBeforeNavFn (to, from, next, pageTitle) {
  globalStore.commit('SET_PAGE_TITLE', pageTitle)
  next()
}

export default new VueRouter({
  /*
   * NOTE! VueRouter "history" mode DOESN'T works for Cordova builds,
   * it is only to be used only for websites.
   *
   * If you decide to go with "history" mode, please also open /config/index.js
   * and set "build.publicPath" to something other than an empty string.
   * Example: '/' instead of current ''
   *
   * If switching back to default "hash" mode, don't forget to set the
   * build publicPath back to '' so Cordova builds work again.
   */

  routes: [
    {
      path: '/',
      component: load('Index'),
      children: [
        { path: '', component: load('Home'), beforeEnter (to, from, next) { defaultBeforeNavFn(to, from, next, 'Home') } },
        { path: 'test', component: load('Test'), beforeEnter (to, from, next) { defaultBeforeNavFn(to, from, next, 'Temp Test Page') } }
      ]
    },
    { path: '*', component: load('Error404') } // Not found
  ]
})
