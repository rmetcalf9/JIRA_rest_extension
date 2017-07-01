<template>
  <div>TEST HOME <br>{{ epic_data }}
  <br>{{ loading_state_txt }}
  <h3>Epcis</h3>
  {{ epics }}
  <h3>Exceptions</h3>
  {{ exceptions }}
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
      return mainJIRADataStore.state.tmp
    },
    loading_state_txt () {
      return mainJIRADataStore.getters.status_txt
    },
    epics () {
      return mainJIRADataStore.getters.epics
    },
    exceptions () {
      return mainJIRADataStore.getters.exceptions
    }
  }
}
</script>

<style>
</style>
