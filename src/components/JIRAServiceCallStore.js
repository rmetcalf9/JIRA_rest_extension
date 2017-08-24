import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

// JIRA API Doc: https://docs.atlassian.com/jira/REST/server/#api/2/search-search

const state = {
  corsproxyprefix: 'http://cc-rjmetcal.ic.ac.uk:1337/',
  host: 'jira.cc.ic.ac.uk',
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
    var authKey = params.authToken
    var callbackPassthrough = {
      OKcallback: {
        method: function (retData, passback) {
          // console.log('setAuthKey got OKPassback')
          // TODO Determine if this log in is acceptable
          passback.commit('SETAUTHKEY', passback.authkey)
          passback.callback.OKcallback.method(retData, passback.callback.OKcallback.params)
        },
        params: {callback: params.callback, authkey: authKey, commit: commit}
      },
      FAILcallback: {
        method: function (retData, passback) {
          // console.log('setAuthKey got FAILPassback')
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
    queryWithDePage(dispatch, params, [])
  }
}

function queryWithDePage (dispatch, params, issuesSoFar) {
  var callbackPassthrough = {
    OKcallback: {
      method: function (retData, passback) {
        // console.log('Query Resp')
        // console.log(retData.data.maxResults)
        // console.log(retData.data.startAt)
        // console.log(retData.data.total)
        // console.log(retData.data.issues)
        if (retData.data.total > (retData.data.startAt + retData.data.maxResults)) {
          queryWithDePage(dispatch, params, issuesSoFar.concat(retData.data.issues))
          // passback.FAILcallback.method({ msg: 'TODO de-paginate query result' }, passback.FAILcallback.params)
        }
        else {
          passback.OKcallback.method(issuesSoFar.concat(retData.data.issues), passback.OKcallback.params)
        }
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
    URLPath: '/rest/api/2/search?jql=' + params.jql + '&maxResults=100&startAt=' + issuesSoFar.length,
    callback: callbackPassthrough
  })
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
    state.corsproxyprefix + state.host + URLPath,
    config
  ).then(function (response) {
    // console.log('callGetServiceINTERNAL response')
    // console.log(response)
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
    if (typeof (response.response) === 'undefined') {
      if (typeof (response.message) === 'undefined') {
        callback.FAILcallback.method({msg: 'Bad Response UNKNOWN', response: response}, callback.FAILcallback.params)
      }
      else {
        console.log(response)
        callback.FAILcallback.method({msg: 'Bad Response ' + response.message, response: response}, callback.FAILcallback.params)
      }
    }
    else if (typeof (response.response.data) !== 'undefined') {
      if (typeof (response.response.data.errorMessages) !== 'undefined') {
        callback.FAILcallback.method({msg: 'Bad Response(' + response.response.data.errorMessages.length + ') ' + response.response.data.errorMessages, response: response.response}, callback.FAILcallback.params)
      }
      else {
        callback.FAILcallback.method({msg: 'Data Bad Response ' + response.response.status, response: response.response}, callback.FAILcallback.params)
      }
    }
    else {
      callback.FAILcallback.method({msg: 'Nested Bad Response ' + response.response.status, response: response.response}, callback.FAILcallback.params)
    }
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
