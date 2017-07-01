import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

const state = {
  host: 'http://localhost:1337/jira.cc.ic.ac.uk',
  authkey: ''
}

const mutations = {
  SETAUTHKEY (state, authkey) {
    state.authkey = authkey
  },
  CLEARAUTHKEY (state) {
    state.authkey = ''
  }
}

const getters = {
  isAuthKeySet: (state, getters) => {
    return state.authkey !== ''
  }
}

const actions = {
  setAuthKey ({commit, state}, params) {
    var authKey = 'Basic ' + params.authToken
    var callbackPassthrough = {
      OKcallback: {
        method: function (retData, passback) {
          // TODO Determine if this log in is acceptable
          passback.callback.OKcallback.method(retData, passback.callback.OKcallback.params)
          passback.commit('SETAUTHKEY', passback.authkey)
        },
        params: {callback: params.callback, authkey: authKey, commit: commit}
      },
      FAILcallback: {
        method: function (retData, passback) {
          passback.FAILcallback.method(retData, passback.FAILcallback.params)
        },
        params: params.callback
      }
    }
    callGetServiceINTERNAL(state, '/rest/api/2/myself', callbackPassthrough, authKey)
  },
  callGetService ({commit, state}, params) {
    callGetServiceINTERNAL(state, params.URLPath, params.callback, state.authkey)
  },
  query ({dispatch}, params) {
    var callbackPassthrough = {
      OKcallback: {
        method: function (retData, passback) {
          // console.log('Query Resp')
          // console.log(retData.data.maxResults)
          // console.log(retData.data.startAt)
          // console.log(retData.data.total)
          // console.log(retData.data.issues)
          console.log('TODO de-paginate query result')
          passback.OKcallback.method(retData.data.issues, passback.OKcallback.params)
        },
        params: params.callback
      },
      FAILcallback: {
        method: function (retData, passback) {
          passback.FAILcallback.method(retData, passback.FAILcallback.params)
        },
        params: params.callback
      }
    }
    dispatch('callGetService', {
      URLPath: '/rest/api/2/search?jql=' + params.jql,
      callback: callbackPassthrough
    })
  }
}

// This function will not use the internal state in the authkey. This is so it
//  can be reused for login and normal calls
function callGetServiceINTERNAL (state, URLPath, callback, authkey) {
  var config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authkey
    }
  }
  // console.log('Making call the config is:')
  // console.log(config)
  axios.get(
    state.host + URLPath,
    config
  ).then(function (response) {
    if (response.status < 200) {
      callback.FAILcallback.method({msg: 'Bad status', response: response}, callback.FAILcallback.params)
    }
    else {
      if (response.status > 299) {
        callback.FAILcallback.method({msg: 'Bad status', response: response}, callback.FAILcallback.params)
      }
      else {
        callback.OKcallback.method(response, callback.OKcallback.params)
      }
    }
  })
  .catch(function (response) {
    callback.FAILcallback.method({msg: 'TODO ERROR', response: response}, callback.FAILcallback.params)
  })
}

Vue.use(Vuex)

// Vuex version
export default new Vuex.Store({
  state,
  mutations,
  getters,
  actions
})