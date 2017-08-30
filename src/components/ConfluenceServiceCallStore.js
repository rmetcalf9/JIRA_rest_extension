import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

// Confluence API Doc: https://docs.atlassian.com/atlassian-confluence/REST/latest-server/#content-getContent

const state = {
  corsproxyprefix: 'http://cc-rjmetcal.ic.ac.uk:1337/',
  host: 'wiki.imperial.ac.uk',
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

function loadDataErrorFn (retData, passback) {
  console.log('Failed when calling confluence')
  console.log(retData)
  passback.callback.FAILcallback.method(retData, passback.callback.FAILcallback.params)
}

function buildUpdateJSONPayload (expandVersionRecord, newHTML) {
  var newBody = expandVersionRecord.body
  newBody.storage.value = newHTML + '<hr />' + newBody.storage.value
  return {
    'version': {
      'number': (expandVersionRecord.version.number + 1),
      'message': 'Automatic upate from JIRA rest extentions by RJM'
    },
    'title': expandVersionRecord.title,
    'type': expandVersionRecord.type,
    'body': newBody
  }
}

const actions = {
  setAuthKey ({commit, state}, params) {
    var authKey = params.authToken
    var callbackPassthrough = {
      OKcallback: {
        method: function (retData, passback) {
          // console.log('confluence setAuthKey got OKPassback')
          // console.log(retData)
          // TODO Determine if this log in is acceptable
          passback.commit('SETAUTHKEY', passback.authkey)
          passback.callback.OKcallback.method(retData, passback.callback.OKcallback.params)
        },
        params: {callback: params.callback, authkey: authKey, commit: commit}
      },
      FAILcallback: {
        method: function (retData, passback) {
          // console.log('confluence setAuthKey got FAILPassback')
          passback.FAILcallback.method(retData, passback.FAILcallback.params)
        },
        params: params.callback
      }
    }
    callGetServiceINTERNAL(state, '/rest/api/user/current', callbackPassthrough, authKey)
  },
  callConfluenceSerivce (store, params) {
    if (params.method === 'get') {
      callGetServiceINTERNAL(store.state, params.apiPath, params.callback, store.state.authkey)
    }
    else {
      callPostServiceINTERNAL(store.state, params.apiPath, params.data, params.callback, store.state.authkey, params.method)
    }
    //    console.log('TODO callConfluence ' + )
    //    params.callback.OKcallback.method({msg: 'OK'}, params.callback.OKcallback.params)
  },
  updatePage (store, params) {
    // params.pageContentTitle -> title used to find page
    // params.newPageText -> new text to replace current page text with

    // Method:
    // Call https://wiki.imperial.ac.uk/rest/api/content?spaceKey=IED&title=' + params.pageContentTitle + '&expand=version
    // check results.data.size = 1
    // get single result
    // build JSON
    // call put on http://wiki.imperial.ac.uk/rest/api/content/84101775

    var callback = {
      OKcallback: {
        method: function (retData, passback) {
          if (retData.data.size !== 1) {
            console.log(retData)
            passback.callback.FAILcallback.method({msg: 'Didnt get single result', response: retData}, passback.callback.FAILcallback.params)
            return
          }
          var id = retData.data.results[0].id
          var updPayload = buildUpdateJSONPayload(retData.data.results[0], passback.newPageText)

          var callback = {
            OKcallback: {
              method: function (retData, passback) {
                passback.callback.OKcallback.method({msg: 'OK', url: 'https://' + store.state.host + '/display/IED/' + passback.pageContentTitle}, passback.callback.OKcallback.params)
              },
              params: passback
            },
            FAILcallback: {
              method: loadDataErrorFn,
              params: passback
            }
          }
          store.dispatch('callConfluenceSerivce', {
            apiPath: '/rest/api/content/' + id,
            method: 'put',
            data: updPayload,
            callback: callback
          })
        },
        params: params
      },
      FAILcallback: {
        method: loadDataErrorFn,
        params: params
      }
    }

    store.dispatch('callConfluenceSerivce', {
      apiPath: '/rest/api/content?spaceKey=IED&title=' + params.pageContentTitle + '&expand=version,body.storage',
      method: 'get',
      callback: callback
    })
  }
}

function callGetServiceINTERNAL (state, URLPath, callback, authkey) {
  var config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authkey
    }
  }
  // console.log('Making confluence call:')
  // console.log(state.host + URLPath)
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

function callPostStyle (url, data, config, method) {
  if (method === 'post') {
    return axios.post(
      url,
      data,
      config
    )
  }
  if (method === 'put') {
    return axios.put(
      url,
      data,
      config
    )
  }
}

function callPostServiceINTERNAL (state, URLPath, data, callback, authkey, method) {
  var config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authkey
    }
  }
  // console.log('Making confluence call:')
  // console.log(state.host + URLPath)
  // console.log(config)
  callPostStyle(
    state.corsproxyprefix + state.host + URLPath,
    data,
    config,
    method
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
