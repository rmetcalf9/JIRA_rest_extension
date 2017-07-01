// Global Store - contains server information, and user information
import Vue from 'vue'
import Vuex from 'vuex'
import JIRAServiceCallStore from './JIRAServiceCallStore'

const state = {
  state: 0 // 0 = CREATED, 1 = LOADING, 2 = LOADED, 3 = ERROR
}

const mutations = {
  START_LOADING (state) {
    state.state = 1
  },
  COMPLETED_LOADING (state) {
    state.state = 2
  },
  ERRORED_LOADING (state) {
    state.state = 3
  }
}

const getters = {
  status_txt: (state, getters) => {
    if (state.state === 0) return 'Created'
    if (state.state === 1) return 'Loading'
    if (state.state === 2) return 'Loaded'
    if (state.state === 3) return 'Error'
    return 'Unknown'
  }
}

const actions = {
  loadJIRAdata ({commit, state}) {
    commit('START_LOADING')
    var callback = {
      OKcallback: {
        method: function (retData, passback) {
          commit('COMPLETED_LOADING')
        },
        params: {}
      },
      FAILcallback: {
        method: function (retData, passback) {
          console.log('Failed to load JIRA data')
          console.log(retData)
          commit('ERRORED_LOADING')
        },
        params: {}
      }
    }
    JIRAServiceCallStore.dispatch('query', {
      jql: 'project+%3D+SPI+AND+issuetype+%3D+Epic+ORDER+BY+KEY',
      callback: callback
    })
    // state.calljira.query('ABC', callback)
  }
}

Vue.use(Vuex)

// Vuex version
export default new Vuex.Store({
  state,
  mutations,
  getters,
  actions
})
