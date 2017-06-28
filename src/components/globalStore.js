// Global Store - contains server information, and user information
import Vue from 'vue'
import Vuex from 'vuex'
import callJIRA from './CallJIRA'

const state = {
  pageTitle: 'Default Page Title'
}

const mutations = {
  SET_PAGE_TITLE (state, link) {
    state.pageTitle = 'JIRA rest extenstions by RJM - ' + link
  },
  LOGOUT (state) {
    callJIRA.clearAuthKey()
  }
}

const getters = {
  is_logged_in: (state, getters) => {
    return callJIRA.isAuthKeySet()
  }
}

const actions = {
  loginuser ({commit}, params) {
    // Need to call JIRA and ensure this is a valid user
    var authToken = btoa(params.username + ':' + params.password)
    callJIRA.setAuthKey('Basic ' + authToken, params.callback)
    // callJIRA.callGetService('/rest/api/2/mypermissions', params.callback)

    // params.callback.FAILcallback.method({msg: 'Not Implemented'}, params.callback.FAILcallback.params)
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
