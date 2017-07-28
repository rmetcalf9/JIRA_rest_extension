// Global Store - contains server information, and user information
import Vue from 'vue'
import Vuex from 'vuex'
import JIRAServiceCallStore from './JIRAServiceCallStore'

// Store for collecting all JIRA project infomation
const state = {
  state: 0, // 0 = CREATED, 1 = LOADING, 2 = LOADED, 3 = ERROR
  projectQueryResponse: {},
  // curried function recieves response and will give a function to access particular project
  getProject: function (projectQueryResponse) {
    return function (projectKey) {
      for (var curProj in projectQueryResponse.data) {
        if (projectQueryResponse.data[curProj].key === projectKey) return projectQueryResponse.data[curProj]
      }
      return undefined
    }
  }
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
  },
  SAVE_QUERY_RESULTS (state, params) {
    state.projectQueryResponse = params.projectQueryResponse
    state.state = 2
  }
}

const getters = {
  status_txt: (state, getters) => {
    if (state.state === 0) return 'Created'
    if (state.state === 1) return 'Loading'
    if (state.state === 2) return 'Loaded'
    if (state.state === 3) return 'Error'
    return 'Unknown'
  },
  projectQueryResponse: (state, getters) => {
    return state.projectQueryResponse
  },
  // return a curried function. Pre-fill the query response into the function
  projects: (state, getters) => {
    return state.getProject(state.projectQueryResponse)
  }
}

const actions = {
  loadJIRAdata ({commit, state}, params) {
    commit('START_LOADING')
    var callback = {
      OKcallback: {
        method: function (projectQueryResponse, passback) {
          commit('SAVE_QUERY_RESULTS', {projectQueryResponse: projectQueryResponse})
          passback.callback.OKcallback.method({msg: 'TODO'}, passback.callback.OKcallback.params)
        },
        params: {state: state, commit: commit, callback: params.callback}
      },
      FAILcallback: {
        method: loadDataErrorFn,
        params: {commit: commit, callback: params.callback}
      }
    }
    JIRAServiceCallStore.dispatch('callGetService', {
      URLPath: '/rest/api/2/project',
      callback: callback
    })
  }
}

function loadDataErrorFn (retData, passback) {
  console.log('Failed to load JIRA data')
  console.log(retData)
  passback.commit('ERRORED_LOADING')
  passback.callback.FAILcallback.method(retData, passback.callback.FAILcallback.params)
}

Vue.use(Vuex)

// Vuex version
export default new Vuex.Store({
  state,
  mutations,
  getters,
  actions
})
