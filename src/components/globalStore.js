// Global Store - contains server information, and user information
import Vue from 'vue'
import Vuex from 'vuex'
import JIRAServiceCallStore from './JIRAServiceCallStore'

const state = {
  pageTitle: 'Default Page Title'
}

const mutations = {
  SET_PAGE_TITLE (state, link) {
    state.pageTitle = 'JIRA rest extenstions by RJM - ' + link
  },
  LOGOUT (state) {
    JIRAServiceCallStore.commit('CLEARAUTHKEY')
  }
}

const getters = {
  is_logged_in: (state, getters) => {
    var t = JIRAServiceCallStore.getters.isAuthKeySet
    return t
  }
}

const actions = {
  loginuser ({commit}, params) {
    // Need to call JIRA and ensure this is a valid user
    var authToken = btoa(params.username + ':' + params.password)
    JIRAServiceCallStore.dispatch('setAuthKey', {authToken: 'Basic ' + authToken, callback: params.callback})
    //  callJIRAstore.getters.calljira.setAuthKey('Basic ' + authToken, params.callback)
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
