<template>
  <div><h3>Microsoft Project Utility</h3>
  The following is a csv format project file. Copy it into a text file and import to project.
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
  else {
    name = obj.name
    outlineLevel = 1
    scheduledWork = '' // Let project caculate sum
    resourceNames = ''
  }
  outputCSV += linenum
  outputCSV += ','
  outputCSV += name
  outputCSV += ','
  outputCSV += '""' // Predecessors
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
      epics.map(function (epic) {
        csv.push(epic)
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
      // console.log(getObjFormKey('SSJ-53'))
      return outputCSV
    }
  },
  methods: {
  }
}
</script>

<style>
</style>
