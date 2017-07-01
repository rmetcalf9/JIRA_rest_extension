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
          addUserStories(passback.commit, epics)
        },
        params: {commit: commit}
      },
      FAILcallback: {
        method: loadDataErrorFn,
        params: {commit: commit}
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
}

function addUserStories (commit, epics) {
  var callback = {
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
            tasks: []
          }
          epics[epickey].user_stories[issues[i].key] = userStory
          userStoryEpicMap[userStorykey] = epickey
        }
        addTasks(passback.commit, epics, userStoryEpicMap)
      },
      params: {commit: commit}
    },
    FAILcallback: {
      method: loadDataErrorFn,
      params: {commit: commit}
    }
  }
  JIRAServiceCallStore.dispatch('query', {
    jql: 'project+%3D+SPI+AND+issuetype+%3D+Story+ORDER+BY+KEY',
    callback: callback
  })
}

function addTasks (commit, epics, userStoryEpicMap) {
  var callback = {
    OKcallback: {
      method: function (issues, passback) {
        console.log(issues)
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
            console.log(epicKey + ':' + userStoryKey)
          }
        }
        console.log(epics)
        passback.commit('COMPLETED_LOADING')
      },
      params: {commit: commit}
    },
    FAILcallback: {
      method: loadDataErrorFn,
      params: {commit: commit}
    }
  }
  JIRAServiceCallStore.dispatch('query', {
    jql: 'project+%3D+SPI+AND+issuetype+%3D+Task+ORDER+BY+KEY',
    callback: callback
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
