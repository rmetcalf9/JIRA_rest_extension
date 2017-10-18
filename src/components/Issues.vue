<template>
  <div>
  <h3>Issues</h3>
  {{ issues }}
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
    issues () {
      return mainJIRADataStore.getters.issues
    }
  }
}
</script>

<style>
</style>
