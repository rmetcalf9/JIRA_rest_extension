<template>
  <div>TEST2 HOME <br>
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
