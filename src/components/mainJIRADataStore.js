// Global Store - contains server information, and user information
import Vue from 'vue'
import Vuex from 'vuex'
import JIRAServiceCallStore from './JIRAServiceCallStore'

const state = {
  state: 0, // 0 = CREATED, 1 = LOADING, 2 = LOADED, 3 = ERROR
  epics: [],
  exceptions: [],
  project: {
    progressPercantage: 0,
    numUserStories: 0,
    numPoints: 0,
    numBurnedPoints: 0,
    sprints: []
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
  SAVE_EPICS (state, params) {
    state.epics = []
    var epics = params.forGlobalState.epics
    var projectSummedTaskStoryPoints = 0
    var projectSummedTaskBurnedStoryPoints = 0
    var numUserStoriesInThisProject = 0
    for (var epic in epics) {
      var numUserStoriesInThisEpic = 0
      var newUserStories = []
      if (typeof (epics[epic].key) === 'undefined') {
        console.log('ERROR Epic with Undefined key')
      }
      else {
        var epicSummedTaskStoryPoints = 0
        var epicSummedTaskBurnedStoryPoints = 0
        for (var userstory in epics[epic].user_stories) {
          numUserStoriesInThisEpic++
          var us = epics[epic].user_stories[userstory]
          var newTasks = []
          var progress = us.story_points
          var summedTaskStoryPoints = 0
          var summedTaskBurnedStoryPoints = 0
          var numTasks = 0
          var numEstimatedTasks = 0
          for (var task in epics[epic].user_stories[userstory].tasks) {
            numTasks++
            if (epics[epic].user_stories[userstory].tasks[task].story_points !== null) numEstimatedTasks++
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
          if (numEstimatedTasks !== numTasks) {
            params.forGlobalState.exceptions = addException(params.forGlobalState.exceptions, epics[epic].user_stories[userstory].key, 'Story with some but not all Tasks estimated')
          }
          if (numTasks === 0) {
            summedTaskStoryPoints = null
            epics[epic].user_stories[userstory].summedStoryPoints = us.story_points
            epics[epic].user_stories[userstory].summedBurnedStoryPoints = 0
          }
          else {
            // user story with tasks.
            // we must use the summedTaskStoryPoints or us.story_points which ever is greater
            epics[epic].user_stories[userstory].summedStoryPoints = summedTaskStoryPoints
            if (us.story_points > summedTaskStoryPoints) {
              epics[epic].user_stories[userstory].summedStoryPoints = us.story_points
            }
            epics[epic].user_stories[userstory].summedBurnedStoryPoints = summedTaskBurnedStoryPoints

            newTasks = newTasks.sort(function (ak, bk) {
              if (ak.rank === bk.rank) return 0
              if (ak.rank < bk.rank) return -1
              return 1
            })
          }

          // Add an exception for this userstory if it is in a sprint and it's story points don't match summed story points
          if (us.sprintid !== null) {
            if (summedTaskStoryPoints !== us.story_points) {
              params.forGlobalState.exceptions = addException(params.forGlobalState.exceptions, epics[epic].user_stories[userstory].key, 'Story in sprint but estimate (' + us.story_points + ') dosen\'t match sum of task story points (' + summedTaskStoryPoints + ')')
            }
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

          epicSummedTaskStoryPoints += epics[epic].user_stories[userstory].summedStoryPoints
          epicSummedTaskBurnedStoryPoints += epics[epic].user_stories[userstory].summedBurnedStoryPoints

          newUserStories.push(epics[epic].user_stories[userstory])
        }
        epics[epic].summedStoryPoints = epicSummedTaskStoryPoints
        epics[epic].summedBurnedStoryPoints = epicSummedTaskBurnedStoryPoints

        if (numUserStoriesInThisEpic > 1) {
          newUserStories = newUserStories.sort(function (ak, bk) {
            if (ak.rank === bk.rank) return 0
            if (ak.rank < bk.rank) return -1
            return 1
          })
        }
        epics[epic].user_stories = newUserStories
        state.epics.push(epics[epic])

        projectSummedTaskStoryPoints += epicSummedTaskStoryPoints
        projectSummedTaskBurnedStoryPoints += epicSummedTaskBurnedStoryPoints
      }
      numUserStoriesInThisProject += numUserStoriesInThisEpic
    }
    if (projectSummedTaskStoryPoints === 0) {
      state.project.progressPercantage = 0
    }
    else {
      state.project.progressPercantage = Math.round((100 * projectSummedTaskBurnedStoryPoints) / projectSummedTaskStoryPoints)
    }
    state.project.numUserStories = numUserStoriesInThisProject
    state.project.numPoints = projectSummedTaskStoryPoints
    state.project.numBurnedPoints = projectSummedTaskBurnedStoryPoints
    state.exceptions = params.forGlobalState.exceptions
    state.project.sprints = params.forGlobalState.sprints

    // Sort the epics by JIRA rank
    state.epics = state.epics.sort(function (ak, bk) {
      if (ak.rank === bk.rank) return 0
      if (ak.rank < bk.rank) return -1
      return 1
    })
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
          // console.log('Epic query sesponses')
          // console.log(issues)
          var forGlobalState = {
            epics: [],
            exceptions: [],
            sprints: {}
          }
          for (var i = 0; i < issues.length; i++) {
            forGlobalState.epics[issues[i].key] = {
              id: issues[i].id,
              key: issues[i].key,
              name: issues[i].fields.customfield_10801,
              user_stories: [],
              summedStoryPoints: 0,
              summedBurnedStoryPoints: 0,
              rank: issues[i].fields.customfield_11000
            }
          }
          // We have now collected all the epics
          // now query user stories
          addUserStories(passback.commit, forGlobalState, passback.callback)
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

function addUserStories (commit, forGlobalState, callback) {
  var callback2 = {
    OKcallback: {
      method: function (issues, passback) {
        // console.log('User story query response')
        // console.log(issues)
        var userStoryEpicMap = []
        for (var i = 0; i < issues.length; i++) {
          var epickey = issues[i].fields.customfield_10800
          if (typeof (epickey) !== 'string') {
            passback.forGlobalState.exceptions = addException(passback.forGlobalState.exceptions, issues[i].key, 'User story with no Epic set')
          }
          else {
            var userStorykey = issues[i].key
            var storyPoints = 0
            if (issues[i].fields.customfield_10004 == null) {
              passback.forGlobalState.exceptions = addException(passback.forGlobalState.exceptions, issues[i].key, 'User Story without estimate')
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
              summedBurnedStoryPoints: 0,
              rank: issues[i].fields.customfield_11000,
              sprintid: getSprintID(issues[i].fields.customfield_10501, issues[i].key, passback.forGlobalState)
            }
            passback.forGlobalState.epics[epickey].user_stories[issues[i].key] = userStory
            userStoryEpicMap[userStorykey] = epickey
          }
        }
        addTasks(passback.commit, userStoryEpicMap, passback.callback, passback.forGlobalState)
      },
      params: {commit: commit, callback: callback, forGlobalState: forGlobalState}
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

function addException (exceptions, key, msg) {
  exceptions.push({
    key: key,
    msg: msg
  })
  return exceptions
}

function addTasks (commit, userStoryEpicMap, callback, forGlobalState) {
  var callback2 = {
    OKcallback: {
      method: function (issues, passback) {
        // console.log('Task query response')
        // console.log(issues)
        for (var i = 0; i < issues.length; i++) {
          // ignoring epic in task, epic looked up based on user story
          if ((typeof (issues[i].fields.customfield_11101) === 'undefined') || (issues[i].fields.customfield_11101 === null)) {
            passback.forGlobalState.exceptions = addException(passback.forGlobalState.exceptions, issues[i].key, 'Task without userstorykey set')
          }
          else {
            for (var j = 0; j < issues[i].fields.customfield_11101.length; j++) {
              var userStoryKey = issues[i].fields.customfield_11101[j]
              if (typeof (userStoryKey) === 'undefined') {
                passback.forGlobalState.exceptions = addException(passback.forGlobalState.exceptions, issues[i].key, 'Task without invalid userstorykey set')
              }
              else {
                var epicKey = userStoryEpicMap[userStoryKey]
                passback.forGlobalState.epics[epicKey].user_stories[userStoryKey].tasks[issues[i].key] = {
                  id: issues[i].id,
                  key: issues[i].key,
                  summary: issues[i].fields.summary,
                  description: issues[i].fields.description,
                  status: issues[i].fields.status.name,
                  story_points: issues[i].fields.customfield_10004,
                  rank: issues[i].fields.customfield_11000,
                  sprintid: getSprintID(issues[i].fields.customfield_10501, issues[i].key, passback.forGlobalState)
                }
              }
            } // if custom field
            // console.log(epicKey + ':' + userStoryKey)
          }
        }
        passback.commit('SAVE_EPICS', {forGlobalState: forGlobalState})
        passback.commit('COMPLETED_LOADING')

        passback.callback.OKcallback.method({msg: 'OK'}, passback.callback.OKcallback.params)
      },
      params: {commit: commit, callback: callback, forGlobalState: forGlobalState}
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

function getSprintID (sprintField, issueKey, forGlobalState) {
  if (sprintField === null) return null
  if (sprintField.length === 0) return null
  if (sprintField.length !== 1) {
    forGlobalState.exceptions = addException(forGlobalState.exceptions, issueKey, 'Issue in more than one sprint')
    return null
  }
  // sprintField is something like com.atlassian.greenhopper.service.sprint.Sprint@22edc5f4[id=86,rapidViewId=89,state=ACTIVE,name=Simp Task Sprint 1,startDate=2017-07-18T15:54:08.499+01:00,endDate=2017-07-25T15:54:00.000+01:00,completeDate=<null>,sequence=86]
  // extract the ID

  var fieldListStart = sprintField[0].search('\\[id=')
  var fieldList = sprintField[0].substr(fieldListStart + 1, sprintField[0].length - (fieldListStart + 2)).split(',')
  fieldList = fieldList.map(function (x) {
    var pair = x.split('=')
    return {
      name: pair[0],
      value: pair[1]
    }
  })

  var gv = function (value) {
    var ret = null
    fieldList.forEach(function (x) {
      if (x.name === value) {
        ret = x.value
      }
    })
    return ret
  }

  // should get is fieldList='86,ra'
  var sprintID = gv('id') // fieldList.substring(0, fieldList.search(','))

  sprintID = parseInt(sprintID)

  // console.log('SPID=')
  // console.log(sprintID)
  // console.log(forGlobalState.sprints[sprintID])

  if (typeof (forGlobalState.sprints[sprintID]) === 'undefined') {
    forGlobalState.sprints[sprintID] = {
      id: sprintID,
      name: gv('name'),
      state: gv('state'),
      start: gv('startDate'),
      end: gv('endDate'),
      complete: gv('completeDate'),
      sequence: gv('sequence')
    }
    // console.log(forGlobalState.sprints)
    // console.log(forGlobalState.sprints.length)
  }

  return sprintID
}

Vue.use(Vuex)

// Vuex version
export default new Vuex.Store({
  state,
  mutations,
  getters,
  actions
})
