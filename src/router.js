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

function requireAuth (to, from, next) {
  var x = false
  if (typeof (globalStore) !== 'undefined') {
    if (typeof (globalStore.getters) !== 'undefined') {
      x = globalStore.getters.is_logged_in
    }
  }
  // console.log('Check auth')
  // console.log(x)
  if (!x) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
  else {
    next()
  }
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
      beforeEnter: requireAuth,
      children: [
        { path: '', component: load('DetailedProgress'), beforeEnter (to, from, next) { defaultBeforeNavFn(to, from, next, 'Home') } },
        { path: 'exceptions', component: load('Exceptions'), beforeEnter (to, from, next) { defaultBeforeNavFn(to, from, next, 'Exceptions') } },
        { path: 'sprints', component: load('Sprints'), beforeEnter (to, from, next) { defaultBeforeNavFn(to, from, next, 'Sprints') } },
        { path: 'sprints/:sprintID', component: load('DetailedProgress'), beforeEnter (to, from, next) { defaultBeforeNavFn(to, from, next, 'Sprint ' + to.params.sprintID) } },
        { path: 'progress', component: load('Progress'), beforeEnter (to, from, next) { defaultBeforeNavFn(to, from, next, 'Progress') } },
        { path: 'test', component: load('Test'), beforeEnter (to, from, next) { defaultBeforeNavFn(to, from, next, 'Temp Test Page') } },
        { path: '/changeproject', component: load('ChangeProject'), beforeEnter (to, from, next) { defaultBeforeNavFn(to, from, next, 'Change Project') } }
      ]
    },
    { path: '/login', component: load('Login'), beforeEnter (to, from, next) { defaultBeforeNavFn(to, from, next, 'Login') } },
    { path: '/logout',
      beforeEnter (to, from, next) {
        globalStore.commit('LOGOUT')
        next('/login')
      }
    },
    { path: '*', component: load('Error404') } // Not found
  ]
})
