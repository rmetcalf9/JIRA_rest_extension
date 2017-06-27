<template>
  <div>TEST HOME <br>{{ epic_data }}
  <br>{{ loading_state_txt }}
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
    }
  }
}
</script>

<style>
</style>
