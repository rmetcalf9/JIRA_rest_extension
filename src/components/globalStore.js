// Global Store - contains server information, and user information
import Vue from 'vue'
import Vuex from 'vuex'
import callJIRAstore from './mainJIRADataStore'

const state = {
  pageTitle: 'Default Page Title'
}

const mutations = {
  SET_PAGE_TITLE (state, link) {
    state.pageTitle = 'JIRA rest extenstions by RJM - ' + link
  },
  LOGOUT (state) {
    callJIRAstore.getters.calljira.clearAuthKey()
  }
}

const getters = {
  is_logged_in: (state, getters) => {
    return callJIRAstore.getters.calljira.isAuthKeySet()
  }
}

const actions = {
  loginuser ({commit}, params) {
    // Need to call JIRA and ensure this is a valid user
    var authToken = btoa(params.username + ':' + params.password)
    callJIRAstore.getters.calljira.setAuthKey('Basic ' + authToken, params.callback)
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
