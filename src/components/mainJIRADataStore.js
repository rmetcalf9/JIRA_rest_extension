// Global Store - contains server information, and user information
import Vue from 'vue'
import Vuex from 'vuex'
import JIRAServiceCallStore from './JIRAServiceCallStore'
import jqlArgumentUtils from './jqlArgumentUtils'

// Main state for this store
const state = {
  state: 0, // 0 = CREATED, 1 = LOADING, 2 = LOADED, 3 = ERROR
  issues: {}, // Map of issues so we can lookup
  issuesArray: [], // Array of issues
  epics: [],
  exceptions: [],
  project: {
    progressPercantage: 0,
    numUserStories: 0,
    numPoints: 0,
    numBurnedPoints: 0,
    sprints: {},
    bugsPending: 0,
    bugsInProgress: 0,
    bugsBlocked: 0,
    bugsResolved: 0
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
  // Saves Epics, stories and bugs
  SAVE_EPICS (state, params) {
    state.issues = params.forGlobalState.issues // direct assignment no caculations
    state.issuesArray = Object.keys(state.issues).map(function (key) { return state.issues[key] })
    // sort the issueArray by rank
    state.issuesArray = state.issuesArray.sort(function (ak, bk) {
      if (ak.rank === bk.rank) return 0
      if (ak.rank < bk.rank) return -1
      return 1
    })

    state.project.sprints = params.forGlobalState.sprints
    // Sort epics in each sprint by JIRA rank TODO Remove this
    for (var sprintID in state.project.sprints) {
      state.project.sprints[sprintID].epics = state.project.sprints[sprintID].epics.sort(function (ak, bk) {
        if (ak.rank === bk.rank) return 0
        if (ak.rank < bk.rank) return -1
        return 1
      })
    }

    // Old calc code below - to be eliminates
    state.epics = []
    var epics = params.forGlobalState.epics
    var projectSummedTaskStoryPoints = 0
    var projectSummedTaskBurnedStoryPoints = 0
    var projectSummedbugsPending = 0
    var projectSummedbugsInProgress = 0
    var projectSummedbugsBlocked = 0
    var projectSummedbugsResolved = 0

    var numUserStoriesInThisProject = 0

    for (var epic in epics) {
      var numUserStoriesInThisEpic = 0
      if (typeof (epics[epic].key) === 'undefined') {
        console.log('ERROR Epic with Undefined key')
      }
      else {
        var epicSummedTaskStoryPoints = 0
        var epicSummedTaskBurnedStoryPoints = 0
        for (var userstoryID in epics[epic].user_stories) {
          numUserStoriesInThisEpic++
          var userstory = epics[epic].user_stories[userstoryID]

          // TODO once epic postload caculation is implemented this code can be removed
          var summedTaskStoryPoints = 0
          var summedTaskBurnedStoryPoints = 0
          var tasksInThisStory = userstory.tasksFN()
          for (var taskID in tasksInThisStory) {
            var task = tasksInThisStory[taskID]
            if (summedTaskStoryPoints !== null) {
              if (task.story_points === null) {
                summedTaskStoryPoints = null
              }
              else {
                if (task.status === 'Done') summedTaskBurnedStoryPoints += task.story_points
                summedTaskStoryPoints += task.story_points
              }
            }
          }

          if (tasksInThisStory.length === 0) {
            summedTaskStoryPoints = null
            userstory.summedStoryPoints = userstory.story_points
            userstory.summedBurnedStoryPoints = 0
          }
          else {
            // user story with tasks.
            // we must use the summedTaskStoryPoints or userstory.story_points which ever is greater
            userstory.summedStoryPoints = summedTaskStoryPoints
            if (userstory.story_points > summedTaskStoryPoints) {
              userstory.summedStoryPoints = userstory.story_points
            }
            userstory.summedBurnedStoryPoints = summedTaskBurnedStoryPoints
          }

          // TODO Move to post load caculation for epic
          epicSummedTaskStoryPoints += userstory.summedStoryPoints
          epicSummedTaskBurnedStoryPoints += userstory.summedBurnedStoryPoints
        }
        epics[epic].summedStoryPoints = epicSummedTaskStoryPoints
        epics[epic].summedBurnedStoryPoints = epicSummedTaskBurnedStoryPoints

        state.epics.push(epics[epic])

        epics[epic].bugs = state.issues[epics[epic].key].bugsFN()
        projectSummedbugsPending += epics[epic].bugs.Pending
        projectSummedbugsInProgress += epics[epic].bugs.InProgress
        projectSummedbugsBlocked += epics[epic].bugs.Blocked
        projectSummedbugsResolved += epics[epic].bugs.Resolved

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
    state.project.bugsPending = projectSummedbugsPending
    state.project.bugsInProgress = projectSummedbugsInProgress
    state.project.bugsBlocked = projectSummedbugsBlocked
    state.project.bugsResolved = projectSummedbugsResolved

    state.exceptions = params.forGlobalState.exceptions // This line needs to remain and be last in process
    state.stories = params.forGlobalState.stories

    // Sort the epics by JIRA rank
    state.epics = state.epics.sort(function (ak, bk) {
      if (ak.rank === bk.rank) return 0
      if (ak.rank < bk.rank) return -1
      return 1
    })

    // ** TMP code needed for old data structure
    // put epics into sprints
    for (var sprintID2 in params.forGlobalState.sprints) {
      var sprint = params.forGlobalState.sprints[sprintID2]

      var epicsInThisSprint = sprint.getEpicsFN()

      for (var epicID2 in epicsInThisSprint) {
        // need to give OLD version of the epic
        var epic2 = params.forGlobalState.epics[epicsInThisSprint[epicID2].key]
        params.forGlobalState.sprints[sprintID2].epics.push(epic2)
        params.forGlobalState.sprints[sprintID2].epicsKeys[epic2.key] = epic2.key
      }
      // console.log(sprint)
      // console.log(epicsInThisSprint)
    }
    // **TMP CODE END

    // Add the postloadcaculated elements
    //  process these in the order Task -> Story -> Bug -> Epic
    state.issuesArray.sort(
      function (a, b) {
        var aa = getPostLoadCaclProcessOrder(a)
        var bb = getPostLoadCaclProcessOrder(b)
        if (aa < bb) return -1
        if (aa === bb) return 0
        return 1
      }
    ).map(
      function (issue) {
        // console.log('Caculating ' + issue.issuetype)
        issue.postLoadCaculated = caculateIssuePostLoadValues(issue)
        return issue
      }
    )

    raiseBugExecptions(params.forGlobalState)
    raiseSprintExecptions(params.forGlobalState)
    raiseTaskExecptions(params.forGlobalState)
    raiseStoryExecptions(params.forGlobalState)
  },
  SAVE_JIRADATA (state, params) {
    state.srcJiraData = params.srcJiraData
  }
}

function getPostLoadCaclProcessOrder (issue) {
  if (issue.issuetype === 'Epic') return 900
  if (issue.issuetype === 'Bug') return 800
  if (issue.issuetype === 'Story') return 700
  if (issue.issuetype === 'Task') return 600
  console.log('Unknown issue type ' + issue.issuetype)
  return 0
}

// called in the order order Task -> Story -> Bug -> Epic
function caculateIssuePostLoadValues (issue) {
  if (issue.issuetype === 'Story') {
    var summedStoryPoints = 0
    var summedBurnedStoryPoints = 0
    var summedTaskStoryPoints = 0
    var summedTaskBurnedStoryPoints = 0

    var tasksInThisStory = issue.tasksFN()
    for (var taskID in tasksInThisStory) {
      var task = tasksInThisStory[taskID]
      if (summedTaskStoryPoints !== null) {
        if (task.story_points === null) {
          summedTaskStoryPoints = null
        }
        else {
          if (task.status === 'Done') summedTaskBurnedStoryPoints += task.story_points
          summedTaskStoryPoints += task.story_points
        }
      }
    }

    if (tasksInThisStory.length === 0) {
      summedTaskStoryPoints = null
      summedStoryPoints = issue.story_points
      summedBurnedStoryPoints = 0
    }
    else {
      // user story with tasks.
      // we must use the summedTaskStoryPoints or issue.story_points which ever is greater
      summedStoryPoints = summedTaskStoryPoints
      if (issue.story_points > summedTaskStoryPoints) {
        summedStoryPoints = issue.story_points
      }
      summedBurnedStoryPoints = summedTaskBurnedStoryPoints
    }

    var labelText = 'X'
    var completed = false
    var progress = issue.story_points
    if (progress === null) progress = 0
    if (summedTaskStoryPoints !== null) {
      if (summedTaskStoryPoints !== 0) {
        progress = summedTaskBurnedStoryPoints + '/' + summedTaskStoryPoints + ' '
        progress += Math.round((summedTaskBurnedStoryPoints * 100) / summedTaskStoryPoints)
        progress += '%'
      }
    }
    // var progress = '0/0 100%'
    labelText = progress + ' - ' + issue.key + ' (' + issue.status + ') ' + issue.summary
    completed = (summedTaskBurnedStoryPoints === summedTaskStoryPoints)

    return {
      summedStoryPoints: summedStoryPoints,
      summedBurnedStoryPoints: summedBurnedStoryPoints,
      labelText: labelText,
      completed: completed
    }
  }
  if (issue.issuetype === 'Epic') {
    var x = {
      summedStoryPoints: 0,
      summedBurnedStoryPoints: 0
    }
    x = issue.storiesFN().reduce(function (sum, story) {
      return {
        summedStoryPoints: sum.summedStoryPoints + story.postLoadCaculated.summedStoryPoints,
        summedBurnedStoryPoints: sum.summedBurnedStoryPoints + story.postLoadCaculated.summedBurnedStoryPoints
      }
    }, x)
    return {
      summedStoryPoints: x.summedStoryPoints,
      summedBurnedStoryPoints: x.summedBurnedStoryPoints,
      bugs: issue.bugsFN()
    }
  }
  return {}
}

// TASK REM START
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
  if (typeof (forGlobalState.issues[epicKey]) === 'undefined') return 'Undefined'
  if (forGlobalState.issues[epicKey].issuetype !== 'Epic') {
    console.log('ERROR - Not an epic')
    return 'ERROR not an epic'
  }
  return forGlobalState.issues[epicKey].name
}

function isNullOrUndefined (varr) {
  if (varr === null) return true
  if (typeof (varr) === 'undefined') return true
  return false
}

function raiseStoryExecptions (forGlobalState) {
  state.issuesArray.filter(function (curIssue) {
    return (curIssue.issuetype === 'Story')
  }).map(function (issue) {
    var hasNotEstimatedTasks = false
    issue.tasksFN().map(function (task) {
      if (task.story_points === null) hasNotEstimatedTasks = true
    })
    if (issue.sprintid !== null) {
      if (hasNotEstimatedTasks) {
        forGlobalState.exceptions = addException(forGlobalState.exceptions, issue.key, 'Story in Sprint with some but not all Tasks estimated')
      }

      // Add an exception for this userstory if it is in a sprint and it's story points don't match summed story points
      if (issue.postLoadCaculated.summedStoryPoints !== issue.story_points) {
        forGlobalState.exceptions = addException(forGlobalState.exceptions, issue.key, 'Story in sprint but estimate (' + issue.story_points + ') dosen\'t match sum of task story points (' + issue.postLoadCaculated.summedStoryPoints + ')')
      }
    }
    if (typeof (issue.epickey) !== 'string') {
      forGlobalState.exceptions = addException(forGlobalState.exceptions, issue.key, 'User story with no Epic set')
    }
    if (isNullOrUndefined(issue.story_points)) {
      if (issue.status !== 'Open') {
        if (issue.status !== 'Done Criteria Established') {
          forGlobalState.exceptions = addException(forGlobalState.exceptions, issue.key, 'User Story without estimate (Status: ' + issue.status + ')')
        }
      }
    }
  })
}

function raiseSingleTaskExecptions (forGlobalState, task) {
  if (isNullOrUndefined(task.associatedStoryKey)) {
    forGlobalState.exceptions = addException(forGlobalState.exceptions, task.key, 'Task without userstorykey set')
    return
  }
  if (isNullOrUndefined(task.associatedStoryKey)) {
    forGlobalState.exceptions = addException(forGlobalState.exceptions, task.key, 'Task with invalid userstorykey ' + task.associatedStoryKey)
  }
  var story = forGlobalState.issues[task.associatedStoryKey]
  if (isNullOrUndefined(story)) {
    forGlobalState.exceptions = addException(forGlobalState.exceptions, task.key, 'Task has associated user story can\'t be found (' + task.associatedStoryKey + ')')
    return
  }

  var storyEpicKeyText = 'Undefined'
  if (typeof (task.associatedStoryKey) !== 'undefined') {
    if (typeof (forGlobalState.issues[task.associatedStoryKey]) === 'undefined') {
      console.log('************')
    }
    else {
      storyEpicKeyText = getEpicString(forGlobalState, story.epickey)
    }
  }
  if (isNullOrUndefined(task.epickey)) {
    forGlobalState.exceptions = addException(forGlobalState.exceptions, task.key, 'Task has no epic set (Try changing to story epic - ' + storyEpicKeyText + ')')
  }
  else {
    // check if epickey is valid
    if (typeof (forGlobalState.issues[task.epickey]) === 'undefined') {
      // I am not sure if JIRA allows this
      forGlobalState.exceptions = addException(forGlobalState.exceptions, task.key, 'Task epic not found (' + task.epickey + ' - Is it in this project?)')
    }
    else {
      if (task.epickey !== story.epickey) {
        var taskEpicKeyText = getEpicString(forGlobalState, task.epickey)
        forGlobalState.exceptions = addException(forGlobalState.exceptions, task.key, 'Task is not in same epic as story (Task epic is ' + taskEpicKeyText + ', story epic is  ' + storyEpicKeyText + ')')
      }
    }
  }

  // We already have an exception for invalid story key
  // no further checks not runnable
  if (typeof (story) === 'undefined') return

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

function raiseTaskExecptions (forGlobalState) {
  var taskArray = state.issuesArray.filter(function (curIssue) {
    if (curIssue.issuetype !== 'Task') return false
    return true
  })
  for (var taskID in taskArray) {
    raiseSingleTaskExecptions(forGlobalState, taskArray[taskID])
  }
}

function raiseBugExecptions (forGlobalState) {
  var bugsArray = state.issuesArray.filter(function (curIssue) {
    if (curIssue.issuetype !== 'Bug') return false
    return true
  })
  for (var bugID in bugsArray) {
    var bug = bugsArray[bugID]
    if (typeof (bug.epickey) === 'undefined') {
      forGlobalState.exceptions = addException(forGlobalState.exceptions, bug.key, 'Bug has no epic set')
    }
  }
}

function raiseSprintExecptions (forGlobalState) {
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
  issues: (state, getters) => {
    return state.issues
  },
  issuesArray: (state, getters) => {
    return state.issuesArray
  },
  epicsOLD: (state, getters) => {
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
    // TODO Refactor to take epics from issues
    for (var epicID in state.epics) {
      var epic = state.epics[epicID]
      epic.storiesFN().map(function (story) {
        var tasksInThisStory = story.tasksFN()
        for (var taskID in tasksInThisStory) {
          var task = tasksInThisStory[taskID]
          if (task.status === 'On Hold') {
            returnValue.push({
              Epic: { key: epic.key, name: epic.name },
              Story: { key: story.key, summary: story.summary },
              Task: task
            })
          }
        }
      })
      var bugsOnHoldForThisEpicArray = state.issuesArray.filter(function (curIssue) {
        if (curIssue.issuetype !== 'Bug') return false
        if (curIssue.status !== 'On Hold') return false
        return (curIssue.epickey === epic.key)
      })
      for (var bugID in bugsOnHoldForThisEpicArray) {
        var bug = bugsOnHoldForThisEpicArray[bugID]
        returnValue.push({
          Epic: { key: epic.key, name: epic.name },
          Story: { key: 'BUG', summary: 'None (Bug)' },
          Task: bug
        })
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
    var forGlobalState = {
      issues: {},
      epics: [],
      bugs: {},
      exceptions: [],
      sprints: {},
      state: state // Used to access state
    }

    loadIssues(commit, forGlobalState, params.callback)
  }
}

// Partial function for use inside Epic
function caculateStoriesInEpic (epic, state) {
  return function () {
    if (epic.issuetype !== 'Epic') {
      console.log('Warning caculateStoriesInEpic called but not issue passed is not an epic')
      console.log(epic)
      return []
    }
    return state.issuesArray.filter(function (curIssue) {
      if (curIssue.issuetype !== 'Story') return false
      return (curIssue.epickey === epic.key)
    })
  }
}

// Partial function for use inside Story
function caculateTasksInStory (story, state) {
  return function () {
    if (story.issuetype !== 'Story') {
      console.log('Warning caculateTasksInStory called but not issue passed is not a story')
      console.log(story)
      return []
    }
    return state.issuesArray.filter(function (curIssue) {
      if (curIssue.issuetype !== 'Task') return false
      return (curIssue.associatedStoryKey === story.key)
    })
  }
}

// Partial function for use inside Issue structure
function caculateBugsInIssue (issue, state) {
  return function () {
    if (issue.issuetype !== 'Epic') {
      return {
        bugs: [],
        Pending: 0,
        InProgress: 0,
        Blocked: 0,
        Resolved: 0
      }
    }
    // state value passed is the latest, not the evaluated version when the function is partially applied
    var bugArray = state.issuesArray.filter(function (curIssue) {
      if (curIssue.issuetype !== 'Bug') return false
      return (curIssue.epickey === issue.key)
    })
    var Pending = 0
    var InProgress = 0
    var Blocked = 0
    var Resolved = 0
    for (var curBugIdx in bugArray) {
      var curBug = bugArray[curBugIdx]
      if (curBug.status === 'On Hold') {
        Blocked++
      }
      else {
        if (curBug.status === 'Done') {
          Resolved++
        }
        else {
          if (curBug.status === 'In Progress') {
            InProgress++
          }
          else {
            Pending++
          }
        }
      }
    }
    return {
      bugs: bugArray,
      Pending: Pending,
      InProgress: InProgress,
      Blocked: Blocked,
      Resolved: Resolved
    }
  }
}

function undefIfUndef (val) {
  if (val === 'undefined') return undefined
  return val
}

function loadIssues (commit, forGlobalState, callbackIn) {
  // main issue load  mainload
  var callback = {
    OKcallback: {
      method: function (issues, passback) {
        // Code will load all issues. 
        //  Will deal with optional fields in a way that suppoerts Epic, Bug, Story and Task
        //  Derived sub-elements supplied as functions
        //  Caculated sub-elements supplied as functions
        // console.log(issues)
        for (var i = 0; i < issues.length; i++) {
          // console.log(issues[i])
          var userStoryKey = 'undefined'
          if (issues[i].fields.customfield_11101 !== null) {
            for (var j = 0; j < issues[i].fields.customfield_11101.length; j++) {
              userStoryKey = issues[i].fields.customfield_11101[j]
            }
          }
          var epickey = issues[i].fields.customfield_10800
          var thisIssue = {
            issuetype: issues[i].fields.issuetype.name,
            id: issues[i].id,
            key: issues[i].key,
            name: issues[i].fields.customfield_10801, // only epics have names
            summary: issues[i].fields.summary,
            description: issues[i].fields.description,
            rank: issues[i].fields.customfield_11000,
            epickey: epickey,
            status: issues[i].fields.status.name,
            story_points: issues[i].fields.customfield_10004,
            assignee: issues[i].fields.assignee,
            associatedStoryKey: undefIfUndef(userStoryKey),
            sprintid: getSprintID(issues[i].fields.customfield_10501, issues[i].key, forGlobalState, issues[i].fields.issuetype.name, epickey)
          }
          thisIssue.bugsFN = caculateBugsInIssue(thisIssue, forGlobalState.state)
          thisIssue.tasksFN = caculateTasksInStory(thisIssue, forGlobalState.state)
          thisIssue.storiesFN = caculateStoriesInEpic(thisIssue, forGlobalState.state)
          forGlobalState.issues[thisIssue.key] = thisIssue
        }
        loadEpics(commit, forGlobalState, callbackIn)
      },
      params: {}
    },
    FAILcallback: {
      method: loadDataErrorFn,
      params: {commit: commit, callback: callbackIn}
    }
  }
  JIRAServiceCallStore.dispatch('query', {
    jql: jqlArgumentUtils.getIssueRetervialJQL(state.srcJiraData.epicProjects, ['Epic', 'Story', 'Task', 'Bug']),
    callback: callback
  })
}

function loadEpics (commit, forGlobalState, callbackIn) {
  var callback = {
    OKcallback: {
      method: function (issues, passback) {
        // console.log('Epic query sesponses')
        // console.log(issues)
        for (var i = 0; i < issues.length; i++) {
          forGlobalState.epics[issues[i].key] = {
            id: issues[i].id,
            key: issues[i].key,
            name: issues[i].fields.customfield_10801,
            description: issues[i].fields.description,
            user_stories: [],
            summedStoryPoints: 0,
            summedBurnedStoryPoints: 0,
            rank: issues[i].fields.customfield_11000,
            bugs: {},
            issuetype: 'Epic'
          }
          forGlobalState.epics[issues[i].key].storiesFN = caculateStoriesInEpic(forGlobalState.epics[issues[i].key], forGlobalState.state)
        }
        // We have now collected all the epics
        // now query user stories
        addUserStories(passback.commit, forGlobalState, passback.callback)
      },
      params: {state: state, commit: commit, callback: callbackIn}
    },
    FAILcallback: {
      method: loadDataErrorFn,
      params: {commit: commit, callback: callbackIn}
    }
  }
  JIRAServiceCallStore.dispatch('query', {
    jql: jqlArgumentUtils.getIssueRetervialJQL(state.srcJiraData.epicProjects, ['Epic']),
    callback: callback
  })
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
          if (typeof (epickey) === 'string') {
            var userStorykey = issues[i].key
            var storyPoints = 0
            if (issues[i].fields.customfield_10004 != null) {
              storyPoints = issues[i].fields.customfield_10004
            }
            var sprintID = getSprintID(issues[i].fields.customfield_10501, issues[i].key, passback.forGlobalState, 'Story', epickey)
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
            userStory.tasksFN = caculateTasksInStory(forGlobalState.issues[userStorykey], forGlobalState.state)
            passback.forGlobalState.epics[epickey].user_stories[issues[i].key] = userStory
            userStoryEpicMap[userStorykey] = epickey
          }
        }
        loadingChainFinalSteps(passback)
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

function loadingChainFinalSteps (passback) {
  passback.commit('SAVE_EPICS', {forGlobalState: passback.forGlobalState})
  passback.commit('COMPLETED_LOADING')

  passback.callback.OKcallback.method({msg: 'OK'}, passback.callback.OKcallback.params)
}

function caculateEpicsInSprint (sprintID, state) {
  return function () {
    var epicArray = state.issuesArray.filter(function (curEpicIssue) {
      if (curEpicIssue.issuetype !== 'Epic') return false
      var storysInThisEpicAndSprintArray = state.issuesArray.filter(function (curIssue) {
        if (curIssue.issuetype !== 'Story') return false
        if (curIssue.epickey !== curEpicIssue.key) return false
        return (curIssue.sprintid === sprintID)
      })
      return (storysInThisEpicAndSprintArray.length !== 0)
    })
    return epicArray
  }
}

function getSprintDataFromJIRAString (jiraString, forGlobalState) {
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

  var ret = {
    id: parseInt(gv('id')),
    name: gv('name'),
    state: gv('state'),
    start: new Date(gv('startDate')),
    end: new Date(gv('endDate')),
    complete: gv('completeDate'),
    sequence: gv('sequence'),
    hasTasks: false,
    hasStories: false,
    epics: [], // TODO Remove
    epicsKeys: {} // TODO Remove
  }
  ret.getEpicsFN = caculateEpicsInSprint(ret.id, forGlobalState.state)

  return ret
}

function getSprintID (sprintField, issueKey, forGlobalState, sourceIssueType, epickey) {
  if (sprintField === null) return null
  if (sprintField.length === 0) return null

  // Add all sprints we have found to forGlobalState
  var sprintInfo = null
  for (var key in sprintField) {
    var currentSprintInfo = getSprintDataFromJIRAString(sprintField[key], forGlobalState)

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

  if (sourceIssueType === 'Task') {
    forGlobalState.sprints[sprintInfo.id].hasTasks = true
  }
  else if (sourceIssueType === 'Story') {
    forGlobalState.sprints[sprintInfo.id].hasStories = true
  }

  /* REMOVED and moved to temporary code
  // Add the sprint to the epic if it is not already there
  // TODO change this - we don't want to store sprints under epics
  if (typeof (epickey) !== 'undefined') {
    var epic = forGlobalState.issues[epickey]
    console.log(epickey)
    console.log(epic)
    if (isNullOrUndefined(epic)) console.log('ERROR - bad epickey passed - ' + epickey)
    if (typeof (forGlobalState.sprints[sprintInfo.id].epicsKeys[epic.key]) === 'undefined') {
      forGlobalState.sprints[sprintInfo.id].epics.push(epic)
      forGlobalState.sprints[sprintInfo.id].epicsKeys[epic.key] = epic.key
    }
  }
  */

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
