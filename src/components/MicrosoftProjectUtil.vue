<template>
  <div><h3>Microsoft Project Utility</h3>
  The following is a csv format project file. Copy it into a text file and import to project. Epics with an issue linked "is blocked by" to another epic are added as predessors.
  <br>
  <q-input v-model="area" type="textarea" />
  </div>
</template>

<script>
import {
  QInput
} from 'quasar'
import mainJIRADataStore from './mainJIRADataStore'

var csv = []
function getObjFormKey (key) {
  return csv.filter(function (curobj) { return (key === curobj.obj.key) })
}

function outputCSVLine (linenum, obj) {
  var outputCSV = ''
  var name = ''
  var outlineLevel = 0
  var scheduledWork = ''
  var resourceNames
  if (obj.issuetype === 'Story') {
    name = obj.summary
    outlineLevel = 2
    if (obj.postLoadCaculated.summedStoryPoints === null) {
      scheduledWork = '0 days' // Let project caculate sum
    }
    else {
      scheduledWork = obj.postLoadCaculated.summedStoryPoints + ' days' // Let project caculate sum
    }
    // If task name starts with ICIS it is an ERP task
    resourceNames = 'SOA'
    if (name.substr(10, 4) === 'ICIS') {
      resourceNames = 'ERP'
    }
    // If task name starts with OSS it is an ERP task
    if (name.substr(10, 3) === 'OSS') {
      resourceNames = 'ERP'
    }
  }
  else if (obj.issuetype === 'misc') {
    name = obj.name
    outlineLevel = obj.outlineLevel
    scheduledWork = obj.scheduledWork
    resourceNames = obj.resourceNames
  }
  else {
    name = obj.name
    outlineLevel = 1
    scheduledWork = '' // Let project caculate sum
    resourceNames = ''
  }
  var predecessors = ''
  if (obj.issuetype === 'Epic') {
    predecessors = obj.issuelinks.filter(function (o) {
      if (typeof (o.inwardIssue) === 'undefined') return false
      return (o.type.inward === 'is blocked by')
    }).filter(function (o) {
      return (getObjFormKey(o.inwardIssue.key)[0].obj.issuetype === 'Epic')
    }).map(function (o) {
      return getObjFormKey(o.inwardIssue.key)[0].linenum
    })
  }

  outputCSV += linenum
  outputCSV += ','
  outputCSV += name
  outputCSV += ','
  outputCSV += '"' + predecessors + '"' // Predecessors
  outputCSV += ','
  outputCSV += scheduledWork
  outputCSV += ','
  outputCSV += outlineLevel
  outputCSV += ','
  outputCSV += resourceNames
  outputCSV += '\n'
  return outputCSV
}

export default {
  components: {
    QInput
  },
  data () {
    return {
    }
  },
  computed: {
    area () {
      csv = []
      var epics = mainJIRADataStore.getters.epics
      epics.sort(function (a, b) {
        if (a.rank < b.rank) return -1
        if (a.rank === b.rank) return 0
        return 1
      }).map(function (epic) {
        csv.push(epic)
        csv.push({
          issuetype: 'misc',
          name: 'Sign off Functional Spec',
          resourceNames: 'Analysts',
          outlineLevel: 2,
          scheduledWork: 1
        })
        if (epic.name.toUpperCase().endsWith('EDF')) {
          csv.push({
            issuetype: 'misc',
            name: 'Banner APIs ready',
            resourceNames: 'Ellucian',
            outlineLevel: 2,
            scheduledWork: 1
          })
        }
        var stories = epic.storiesFN()
        stories.map(function (story) {
          csv.push(story)
        })
      })
      var outputCSV = 'ID,Name,Predecessors,Scheduled_Work,Outline_Level,Resource_Names\n'
      // add line numbers to csv object
      var n = 1
      csv = csv.map(function (curLine) { return {linenum: (n++), obj: curLine} })

      csv.map(function (curLine) { outputCSV += outputCSVLine(curLine.linenum, curLine.obj) })
      return outputCSV
    }
  },
  methods: {
  }
}
</script>

<style>
</style>
