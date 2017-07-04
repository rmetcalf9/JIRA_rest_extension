// Global Store - contains server information, and user information
import Vue from 'vue'
import Vuex from 'vuex'
import JIRAServiceCallStore from './JIRAServiceCallStore'

const state = {
  state: 0, // 0 = CREATED, 1 = LOADING, 2 = LOADED, 3 = ERROR
  epics: [],
  exceptions: [],
  project: {
    progressPercantage: 0
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
  SAVE_EPICS (state, epics) {
    state.epics = []
    var projectSummedTaskStoryPoints = 0
    var projectSummedTaskBurnedStoryPoints = 0
    for (var epic in epics) {
      var newUserStories = []
      if (typeof (epics[epic].key) !== 'undefined') {
        var epicSummedTaskStoryPoints = 0
        var epicSummedTaskBurnedStoryPoints = 0
        for (var userstory in epics[epic].user_stories) {
          var us = epics[epic].user_stories[userstory]
          var newTasks = []
          var progress = us.story_points
          var summedTaskStoryPoints = 0
          var summedTaskBurnedStoryPoints = 0
          var numTasks = 0
          for (var task in epics[epic].user_stories[userstory].tasks) {
            numTasks++
            if (summedTaskStoryPoints !== null) {
              if (epics[epic].user_stories[userstory].tasks[task].story_points === null) {
                summedTaskStoryPoints = null
              }
              else {
                if (epics[epic].user_stories[userstory].tasks[task].status === 'Done') summedTaskBurnedStoryPoints += epics[epic].user_stories[userstory].tasks[task].story_points
                summedTaskStoryPoints += epics[epic].user_stories[userstory].tasks[task].story_points
              }
            }
            newTasks.push(epics[epic].user_stories[userstory].tasks[task])
          }
          if (numTasks === 0) {
            summedTaskStoryPoints = null
            epics[epic].user_stories[userstory].summedStoryPoints = us.story_points
            epics[epic].user_stories[userstory].summedBurnedStoryPoints = 0
          }
          else {
            epics[epic].user_stories[userstory].summedStoryPoints = summedTaskStoryPoints
            epics[epic].user_stories[userstory].summedBurnedStoryPoints = summedTaskBurnedStoryPoints
          }
          epics[epic].user_stories[userstory].tasks = newTasks
          if (summedTaskStoryPoints !== null) {
            if (summedTaskStoryPoints !== 0) {
              progress = summedTaskBurnedStoryPoints + '/' + summedTaskStoryPoints + ' '
              progress += Math.round((summedTaskBurnedStoryPoints * 100) / summedTaskStoryPoints)
              progress += '%'
            }
          }
          // var progress = '0/0 100%'
          epics[epic].user_stories[userstory].label_text = progress + ' - ' + us.key + ' (' + us.status + ') ' + us.summary

          epicSummedTaskStoryPoints += summedTaskStoryPoints
          epicSummedTaskBurnedStoryPoints += summedTaskBurnedStoryPoints

          newUserStories.push(epics[epic].user_stories[userstory])
        }
        epics[epic].summedStoryPoints = epicSummedTaskStoryPoints
        epics[epic].summedBurnedStoryPoints = epicSummedTaskBurnedStoryPoints
        epics[epic].user_stories = newUserStories
        state.epics.push(epics[epic])

        projectSummedTaskStoryPoints += epicSummedTaskStoryPoints
        projectSummedTaskBurnedStoryPoints += epicSummedTaskBurnedStoryPoints
      }
      if (projectSummedTaskStoryPoints === 0) {
        state.project.progressPercantage = 0
      }
      else {
        state.project.progressPercantage = Math.round((100 * projectSummedTaskBurnedStoryPoints) / projectSummedTaskStoryPoints)
      }
    }
  },
  SAVE_EXCEPTIONS (state, exceptions) {
    state.exceptions = exceptions
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
  },
  exceptions: (state, getters) => {
    return state.exceptions
  },
  project: (state, getters) => {
    return state.project
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
          var exceptions = []
          for (var i = 0; i < issues.length; i++) {
            epics[issues[i].key] = {
              id: issues[i].id,
              key: issues[i].key,
              name: issues[i].fields.customfield_10801,
              user_stories: [],
              summedStoryPoints: 0,
              summedBurnedStoryPoints: 0
            }
          }
          // We have now collected all the epics
          // now query user stories
          addUserStories(passback.commit, epics, passback.callback, exceptions)
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
  passback.callback.FAILcallback.method(retData, passback.callback.FAILcallback.params)
}

function addUserStories (commit, epics, callback, exceptions) {
  var callback2 = {
    OKcallback: {
      method: function (issues, passback) {
        // console.log('User story query response')
        // console.log(issues)
        var userStoryEpicMap = []
        for (var i = 0; i < issues.length; i++) {
          var epickey = issues[i].fields.customfield_10800
          var userStorykey = issues[i].key
          var storyPoints = 0
          if (issues[i].fields.customfield_10004 == null) {
            passback.exceptions = addException(passback.exceptions, issues[i].key, 'User Story without estimate')
          }
          else {
            storyPoints = issues[i].fields.customfield_10004
          }
          var userStory = {
            id: issues[i].id,
            key: userStorykey,
            summary: issues[i].fields.summary,
            description: issues[i].fields.description,
            epickey: epickey,
            tasks: [],
            status: issues[i].fields.status.name,
            label_text: 'FILLED IN LATER',
            story_points: storyPoints,
            summedStoryPoints: 0,
            summedBurnedStoryPoints: 0
          }
          epics[epickey].user_stories[issues[i].key] = userStory
          userStoryEpicMap[userStorykey] = epickey
        }
        addTasks(passback.commit, epics, userStoryEpicMap, passback.callback, passback.exceptions)
      },
      params: {commit: commit, callback: callback, exceptions: exceptions}
    },
    FAILcallback: {
      method: loadDataErrorFn,
      params: {commit: commit, callback: callback, exceptions: exceptions}
    }
  }
  JIRAServiceCallStore.dispatch('query', {
    jql: 'project+%3D+SPI+AND+issuetype+%3D+Story+ORDER+BY+KEY',
    callback: callback2
  })
}

function addException (exceptions, key, msg) {
  exceptions.push({
    key: key,
    msg: msg
  })
  return exceptions
}

function addTasks (commit, epics, userStoryEpicMap, callback, exceptions) {
  var callback2 = {
    OKcallback: {
      method: function (issues, passback) {
        // console.log('Task query response')
        // console.log(issues)
        for (var i = 0; i < issues.length; i++) {
          // ignoring epic in task, epic looked up based on user story
          if ((typeof (issues[i].fields.customfield_11101) === 'undefined') || (issues[i].fields.customfield_11101 === null)) {
            passback.exceptions = addException(passback.exceptions, issues[i].key, 'Task without userstorykey set')
          }
          else {
            for (var j = 0; j < issues[i].fields.customfield_11101.length; j++) {
              var userStoryKey = issues[i].fields.customfield_11101[j]
              if (typeof (userStoryKey) === 'undefined') {
                passback.exceptions = addException(passback.exceptions, issues[i].key, 'Task without invalid userstorykey set')
              }
              else {
                var epicKey = userStoryEpicMap[userStoryKey]
                passback.epics[epicKey].user_stories[userStoryKey].tasks[issues[i].key] = {
                  id: issues[i].id,
                  key: issues[i].key,
                  summary: issues[i].fields.summary,
                  description: issues[i].fields.description,
                  status: issues[i].fields.status.name,
                  story_points: issues[i].fields.customfield_10004
                }
              }
            } // if custom field
            // console.log(epicKey + ':' + userStoryKey)
          }
        }
        // console.log(epics)
        passback.commit('SAVE_EPICS', passback.epics)
        passback.commit('SAVE_EXCEPTIONS', passback.exceptions)
        passback.commit('COMPLETED_LOADING')

        passback.callback.OKcallback.method({msg: 'OK'}, passback.callback.OKcallback.params)
      },
      params: {commit: commit, callback: callback, epics: epics, exceptions: exceptions}
    },
    FAILcallback: {
      method: loadDataErrorFn,
      params: {commit: commit, callback: callback, epics: epics, exceptions: exceptions}
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
