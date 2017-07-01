// Global Store - contains server information, and user information
import Vue from 'vue'
import Vuex from 'vuex'
import JIRAServiceCallStore from './JIRAServiceCallStore'

const state = {
  state: 0, // 0 = CREATED, 1 = LOADING, 2 = LOADED, 3 = ERROR
  epics: []
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
  SAVE_EPICS (state, epics) {
    state.epics = []
    for (var epic in epics) {
      var newUserStories = []
      if (typeof (epics[epic].key) !== 'undefined') {
        for (var userstory in epics[epic].user_stories) {
          var newTasks = []
          for (var task in epics[epic].user_stories[userstory].tasks) {
            newTasks.push(epics[epic].user_stories[userstory].tasks[task])
          }
          epics[epic].user_stories[userstory].tasks = newTasks
          newUserStories.push(epics[epic].user_stories[userstory])
        }
        epics[epic].user_stories = newUserStories
        state.epics.push(epics[epic])
      }
    }
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
  epics: (state, getters) => {
    return state.epics
  }
}

const actions = {
  loadJIRAdata ({commit, state}, params) {
    commit('START_LOADING')
    var callback = {
      OKcallback: {
        method: function (issues, passback) {
          console.log('START OF DATA STORE')
          var epics = []
          for (var i = 0; i < issues.length; i++) {
            epics[issues[i].key] = {
              id: issues[i].id,
              key: issues[i].key,
              name: issues[i].fields.customfield_10801,
              user_stories: []
            }
          }
          // We have now collected all the epics
          // now query user stories
          addUserStories(passback.commit, epics, passback.callback)
        },
        params: {commit: commit, callback: params.callback}
      },
      FAILcallback: {
        method: loadDataErrorFn,
        params: {commit: commit, callback: params.callback}
      }
    }
    JIRAServiceCallStore.dispatch('query', {
      jql: 'project+%3D+SPI+AND+issuetype+%3D+Epic+ORDER+BY+KEY',
      callback: callback
    })
    // state.calljira.query('ABC', callback)
  }
}

function loadDataErrorFn (retData, passback) {
  console.log('Failed to load JIRA data')
  console.log(retData)
  passback.commit('ERRORED_LOADING')
  passback.callBack.FAILcallback.method(retData, passback.callBack.FAILcallback.params)
}

function addUserStories (commit, epics, callback) {
  var callback2 = {
    OKcallback: {
      method: function (issues, passback) {
        var userStoryEpicMap = []
        for (var i = 0; i < issues.length; i++) {
          var epickey = issues[i].fields.customfield_10800
          var userStorykey = issues[i].key
          var userStory = {
            id: issues[i].id,
            key: userStorykey,
            summary: issues[i].fields.summary,
            description: issues[i].fields.description,
            epickey: epickey,
            tasks: [],
            label_text: issues[i].key + ' - ' + issues[i].fields.summary
          }
          epics[epickey].user_stories[issues[i].key] = userStory
          userStoryEpicMap[userStorykey] = epickey
        }
        addTasks(passback.commit, epics, userStoryEpicMap, passback.callback)
      },
      params: {commit: commit, callback: callback}
    },
    FAILcallback: {
      method: loadDataErrorFn,
      params: {commit: commit, callback: callback}
    }
  }
  JIRAServiceCallStore.dispatch('query', {
    jql: 'project+%3D+SPI+AND+issuetype+%3D+Story+ORDER+BY+KEY',
    callback: callback2
  })
}

function addTasks (commit, epics, userStoryEpicMap, callback) {
  var callback2 = {
    OKcallback: {
      method: function (issues, passback) {
        // console.log(issues)
        for (var i = 0; i < issues.length; i++) {
          // ignoring epic in task, epic looked up based on user story
          for (var j = 0; j < issues[i].fields.customfield_11101.length; j++) {
            var userStoryKey = issues[i].fields.customfield_11101[j]
            var epicKey = userStoryEpicMap[userStoryKey]
            epics[epicKey].user_stories[userStoryKey].tasks[issues[i].key] = {
              id: issues[i].id,
              key: issues[i].key,
              summary: issues[i].fields.summary,
              description: issues[i].fields.description
            }
            // console.log(epicKey + ':' + userStoryKey)
            passback.callback.OKcallback.method({msg: 'OK'}, passback.callback.OKcallback.params)
          }
        }
        // console.log(epics)
        passback.commit('SAVE_EPICS', epics)
        passback.commit('COMPLETED_LOADING')
      },
      params: {commit: commit, callback: callback}
    },
    FAILcallback: {
      method: loadDataErrorFn,
      params: {commit: commit, callback: callback}
    }
  }
  JIRAServiceCallStore.dispatch('query', {
    jql: 'project+%3D+SPI+AND+issuetype+%3D+Task+ORDER+BY+KEY',
    callback: callback2
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
