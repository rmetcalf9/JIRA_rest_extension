<template>
  <div>TEST2 HOME <br>{{ epic_data }}
  <br>{{ loading_state_txt }}
  <h3>Issues</h3>
  {{ issues }}
  <h3>Epcis</h3>
  {{ epics }}
  <h3>Exceptions</h3>
  {{ exceptions }}
  <h3>Sprints</h3>
  {{ sprints }}
  </div>
</template>

<script>
import mainJIRADataStore from './mainJIRADataStore'

export default {
  data () {
    return {
    }
  },
  computed: {
    epic_data () {
      console.log('TTT')
      mainJIRADataStore.getters.issuesArray.map(function (issue) {
        if (issue.issuetype === 'Epic') {
          var thisEpicID = -1
          for (var epicID in mainJIRADataStore.getters.epicsOLD) {
            if (mainJIRADataStore.getters.epicsOLD[epicID].key === issue.key) thisEpicID = epicID
          }
          if (thisEpicID === -1) {
            // console.log('Invalid epic id')
          }
          else {
            var thisEpic = mainJIRADataStore.getters.epicsOLD[thisEpicID]
            var a = thisEpic.summedStoryPoints
            var b = issue.postLoadCaculated.summedStoryPoints
            console.log(a)
            console.log(b)
            if (a !== b) console.log(issue.key + ':' + a + ':' + b)
          }
        }
      })
      return mainJIRADataStore.state.tmp
    },
    loading_state_txt () {
      return mainJIRADataStore.getters.status_txt
    },
    issues () {
      return mainJIRADataStore.getters.issues
    },
    epics () {
      return mainJIRADataStore.getters.epics
    },
    exceptions () {
      return mainJIRADataStore.getters.exceptions
    },
    sprints () {
      return mainJIRADataStore.getters.project.sprints
    }
  }
}
</script>

<style>
</style>
