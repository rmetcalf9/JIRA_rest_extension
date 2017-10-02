// Global Store - contains server information, and user information
import Vue from 'vue'
import Vuex from 'vuex'
import JIRAServiceCallStore from './JIRAServiceCallStore'
import jqlArgumentUtils from './jqlArgumentUtils'

// Main state for this store
const state = {
  state: 0, // 0 = CREATED, 1 = LOADING, 2 = LOADED, 3 = ERROR
  epics: [],
  exceptions: [],
  project: {
    progressPercantage: 0,
    numUserStories: 0,
    numPoints: 0,
    numBurnedPoints: 0,
    sprints: {}
  },
  srcJiraData: {
    epicProjects: ['SPI'],
    storyProjects: ['SPI'],
    taskProjects: ['SPI']
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
            raiseTaskExecptions(params.forGlobalState, epics[epic].user_stories[userstory].tasks[task], epics[epic].user_stories[userstory])
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
          epics[epic].user_stories[userstory].completed = (summedTaskBurnedStoryPoints === summedTaskStoryPoints)

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
    raiseSprintExecptions(params.forGlobalState)

    state.project.numUserStories = numUserStoriesInThisProject
    state.project.numPoints = projectSummedTaskStoryPoints
    state.project.numBurnedPoints = projectSummedTaskBurnedStoryPoints
    state.exceptions = params.forGlobalState.exceptions
    state.stories = params.forGlobalState.stories
    state.project.sprints = params.forGlobalState.sprints

    // Sort the epics by JIRA rank
    state.epics = state.epics.sort(function (ak, bk) {
      if (ak.rank === bk.rank) return 0
      if (ak.rank < bk.rank) return -1
      return 1
    })
    // Sort epics in each sprint by JIRA rank
    for (var sprintID in state.project.sprints) {
      state.project.sprints[sprintID].epics = state.project.sprints[sprintID].epics.sort(function (ak, bk) {
        if (ak.rank === bk.rank) return 0
        if (ak.rank < bk.rank) return -1
        return 1
      })
    }
  },
  SAVE_JIRADATA (state, params) {
    state.srcJiraData = params.srcJiraData
  }
}

function padWithLeadingZero (num, places) {
  var tmp = '000000000000000000000000000000000000000000000000000' + num.toString().trim()
  return tmp.substring(tmp.length - places)
}
function truncDate (date) {
  var monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return new Date(padWithLeadingZero(date.getDate(), 2) + ' ' + monthNames[date.getMonth()] + ' ' + padWithLeadingZero(date.getFullYear(), 4))
}

function getEpicString (forGlobalState, epicKey) {
  if (typeof (epicKey) === 'undefined') {
    return 'Undefined'
  }
  return forGlobalState.epics[epicKey].name
}

// Raises task exceptions. (Invalid story exceptions raised during initial task load)
function raiseTaskExecptions (forGlobalState, task, story) {
  var storyDate = new Date('31-DEC-4712')
  var taskDate = new Date('31-DEC-4712')
  if (story.sprintid !== null) {
    // A story may have been in a sprint then moved out of a sprint to a future sprint
    // that sprint may be closed but the story still not delivered - in this case we
    // shouldn't consider the storyDelivary date as set
    if (forGlobalState.sprints[story.sprintid].state !== 'CLOSED') {
      storyDate = truncDate(forGlobalState.sprints[story.sprintid].end)
    }
  }
  if (task.sprintid !== null) {
    taskDate = truncDate(forGlobalState.sprints[task.sprintid].end)
  }

  // Find tasks who's epic dosen't match the user story epic
  var storyEpicKeyText = getEpicString(forGlobalState, story.epickey)
  var taskEpicKeyText = getEpicString(forGlobalState, task.epickey)
  if (typeof (task.epickey) === 'undefined') {
    forGlobalState.exceptions = addException(forGlobalState.exceptions, task.key, 'Task has no epic set (Story epic is ' + storyEpicKeyText + ')')
  }
  else {
    if (task.epickey !== story.epickey) {
      forGlobalState.exceptions = addException(forGlobalState.exceptions, task.key, 'Task is not in same epic as story (Task is ' + taskEpicKeyText + ', story is  ' + storyEpicKeyText + ')')
      console.log(task.epickey)
      console.log(story.epickey)
    }
  }

  if (storyDate < taskDate) {
    if (task.status !== 'Done') {
      if (task.sprintid === null) {
        forGlobalState.exceptions = addException(forGlobalState.exceptions, task.key, 'Task not in sprint but associated user story needs to be delivered on ' + storyDate)
      }
      else {
        forGlobalState.exceptions = addException(forGlobalState.exceptions, task.key, 'Task scheduled to be delivered after story (Task ' + taskDate + ' -> Story ' + storyDate)
      }
    }
  }
}

function raiseSprintExecptions (forGlobalState) {
  // console.log(forGlobalState.sprints)
  Object.keys(forGlobalState.sprints).map(function (objectKey, index) {
    var x = forGlobalState.sprints[objectKey]
    if (x.hasTasks) {
      if (x.hasStories) {
        forGlobalState.exceptions = addException(forGlobalState.exceptions, 'Sprint ' + x.id, 'Sprint has both tasks and stories')
      }
    }
    if (!x.hasTasks) {
      if (!x.hasStories) {
        forGlobalState.exceptions = addException(forGlobalState.exceptions, 'Sprint ' + x.id, 'Sprint has neither tasks nor stories')
      }
    }
  })
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
  },
  srcJiraData: (state, getters) => {
    return state.srcJiraData
  },
  blockages: (state, getters) => {
    var returnValue = []
    for (var epic in state.epics) {
      for (var userStory in state.epics[epic].user_stories) {
        for (var task in state.epics[epic].user_stories[userStory].tasks) {
          if (state.epics[epic].user_stories[userStory].tasks[task].status === 'On Hold') {
            returnValue.push({
              Epic: { key: state.epics[epic].key, name: state.epics[epic].name },
              Story: { key: state.epics[epic].user_stories[userStory].key, summary: state.epics[epic].user_stories[userStory].summary },
              Task: state.epics[epic].user_stories[userStory].tasks[task]
            })
          }
        }
      }
    }
    return returnValue
  }
}

const actions = {
  setSelectedProjects (store, params) {
    // Will set the selected projects
    if (jqlArgumentUtils.joinStringArray(store.state.srcJiraData.epicProjects) === jqlArgumentUtils.joinStringArray(params.projects)) {
      params.callback.OKcallback.method({msg: 'OK'}, params.callback.OKcallback.params)
      console.log('mainJIRADataSTore setSelectedProjects - new value same as origional (' + jqlArgumentUtils.joinStringArray(params.projects) + '===' + jqlArgumentUtils.joinStringArray(store.state.srcJiraData.epicProjects) + ')')
      return
    }

    store.commit('SAVE_JIRADATA', {srcJiraData: {
      epicProjects: params.projects,
      storyProjects: params.projects,
      taskProjects: params.projects
    }})

    var callback = {
      OKcallback: {
        method: function (retData, passback) {
          params.callback.OKcallback.method({msg: 'OK'}, params.callback.OKcallback.params)
        },
        params: {}
      },
      FAILcallback: {
        method: loadDataErrorFn,
        params: {commit: store.commit, callback: params.callback}
      }
    }
    store.dispatch('loadJIRAdata', {callback: callback})
  },
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
            sprints: {},
            state: state // Used to access state
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
        params: {state: state, commit: commit, callback: params.callback}
      },
      FAILcallback: {
        method: loadDataErrorFn,
        params: {commit: commit, callback: params.callback}
      }
    }
    JIRAServiceCallStore.dispatch('query', {
      jql: jqlArgumentUtils.getIssueRetervialJQL(state.srcJiraData.epicProjects, ['Epic']),
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
              if (issues[i].fields.status.name !== 'Open') {
                if (issues[i].fields.status.name !== 'Done Criteria Established') {
                  passback.forGlobalState.exceptions = addException(passback.forGlobalState.exceptions, issues[i].key, 'User Story without estimate (Status: ' + issues[i].fields.status.name + ')')
                }
              }
            }
            else {
              storyPoints = issues[i].fields.customfield_10004
            }
            var sprintID = getSprintID(issues[i].fields.customfield_10501, issues[i].key, passback.forGlobalState, 'Story', passback.forGlobalState.epics[epickey])
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
              sprintid: sprintID,
              completed: false
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
    jql: jqlArgumentUtils.getIssueRetervialJQL(forGlobalState.state.srcJiraData.storyProjects, ['Story']),
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
            var epickey = issues[i].fields.customfield_10800
            if (typeof (epickey) !== 'string') {
              epickey = undefined
            }
            for (var j = 0; j < issues[i].fields.customfield_11101.length; j++) {
              var userStoryKey = issues[i].fields.customfield_11101[j]
              if (typeof (userStoryKey) === 'undefined') {
                passback.forGlobalState.exceptions = addException(passback.forGlobalState.exceptions, issues[i].key, 'Task without invalid userstorykey set')
              }
              else {
                var epicKey = userStoryEpicMap[userStoryKey]
                if (typeof (epicKey) === 'undefined') {
                  passback.forGlobalState.exceptions = addException(passback.forGlobalState.exceptions, issues[i].key, 'Task has invalid asosicated user story (' + userStoryKey + ' - is it actually a user story???)')
                }
                else {
                  passback.forGlobalState.epics[epicKey].user_stories[userStoryKey].tasks[issues[i].key] = {
                    id: issues[i].id,
                    key: issues[i].key,
                    summary: issues[i].fields.summary,
                    description: issues[i].fields.description,
                    epickey: epickey,
                    status: issues[i].fields.status.name,
                    story_points: issues[i].fields.customfield_10004,
                    rank: issues[i].fields.customfield_11000,
                    sprintid: getSprintID(issues[i].fields.customfield_10501, issues[i].key, passback.forGlobalState, 'Task', undefined),
                    assignee: issues[i].fields.assignee
                  }
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
    jql: jqlArgumentUtils.getIssueRetervialJQL(forGlobalState.state.srcJiraData.taskProjects, ['Task']),
    callback: callback2
  })
}

function getSprintDataFromJIRAString (jiraString) {
  // Return the JSON for this sprint or null
  // sprintField is something like com.atlassian.greenhopper.service.sprint.Sprint@22edc5f4[id=86,rapidViewId=89,state=ACTIVE,name=Simp Task Sprint 1,startDate=2017-07-18T15:54:08.499+01:00,endDate=2017-07-25T15:54:00.000+01:00,completeDate=<null>,sequence=86]
  // extract the ID

  var fieldListStart = jiraString.search('\\[id=')
  var fieldList = jiraString.substr(fieldListStart + 1, jiraString.length - (fieldListStart + 2)).split(',')
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

  return {
    id: parseInt(gv('id')),
    name: gv('name'),
    state: gv('state'),
    start: new Date(gv('startDate')),
    end: new Date(gv('endDate')),
    complete: gv('completeDate'),
    sequence: gv('sequence'),
    hasTasks: false,
    hasStories: false,
    epics: [],
    epicsKeys: {}
  }
}

// source can either be 'Task' or 'Story'
function getSprintID (sprintField, issueKey, forGlobalState, source, epic) {
  if (sprintField === null) return null
  if (sprintField.length === 0) return null

  // Add all sprints we have found to forGlobalState
  var sprintInfo = null
  for (var key in sprintField) {
    var currentSprintInfo = getSprintDataFromJIRAString(sprintField[key])

    if (typeof (forGlobalState.sprints[currentSprintInfo.id]) === 'undefined') forGlobalState.sprints[currentSprintInfo.id] = currentSprintInfo
    if (sprintInfo === null) {
      sprintInfo = currentSprintInfo
    }
    else {
      // only take the date if the sprint we are looking at is active (Sometimes a story is moved from active sprint to no sprint)
      if (currentSprintInfo.start > sprintInfo.start) sprintInfo = currentSprintInfo
    }
  }
  if (sprintInfo === null) return null

  if (source === 'Task') {
    forGlobalState.sprints[sprintInfo.id].hasTasks = true
  }
  else if (source === 'Story') {
    forGlobalState.sprints[sprintInfo.id].hasStories = true
  }

  // Add the epic if it is not already there
  if (typeof (epic) !== 'undefined') {
    if (typeof (forGlobalState.sprints[sprintInfo.id].epicsKeys[epic.key]) === 'undefined') {
      forGlobalState.sprints[sprintInfo.id].epics.push(epic)
      forGlobalState.sprints[sprintInfo.id].epicsKeys[epic.key] = epic.key
    }
  }

  return sprintInfo.id
}

Vue.use(Vuex)

// Vuex version
export default new Vuex.Store({
  state,
  mutations,
  getters,
  actions
})
