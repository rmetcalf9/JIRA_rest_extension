<template>
  <div>
    <h2>Change current project</h2>
    Enter project Keys: <q-chips-input v-model="selectedProjects" float-label="Project keys"></q-chips-input>
    <q-btn @click="save" color="primary">
      Save
    </q-btn>
    <h3>Projects</h3>
    <table style="margin-top: 30px;" class="q-table bordered striped-odd">
      <thead>
        <tr>
          <th class="Key">Key</th>
          <th class="Name">Name</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="project in projectQueryResponse.data">
          <td data-th="Key" class="text-left">{{ project.key }}</td>
          <td data-th="Name" class="text-left">{{ project.name }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import mainJIRADataStore from './mainJIRADataStore'
import projectJIRADataStore from './projectJIRADataStore'
import {
  QChipsInput,
  QBtn,
  Loading,
  Toast
} from 'quasar'

export default {
  components: {
    QChipsInput,
    QBtn
  },
  data () {
    return {
      selectedProjects: []
    }
  },
  computed: {
    loading_state_txt () {
      return projectJIRADataStore.getters.status_txt
    },
    projectQueryResponse () {
      return projectJIRADataStore.getters.projectQueryResponse
    }
  },
  methods: {
    save () {
      // Check project codes are valid
      for (var projectKey in this.$data.selectedProjects) {
        var curProj = projectJIRADataStore.getters.projects(this.$data.selectedProjects[projectKey])
        if (typeof (curProj) === 'undefined') {
          Toast.create(this.$data.selectedProjects[projectKey] + ' is not a valid project key')
          return
        }
      }
      Loading.show()

      // Give new project codes to mainJIRADataStore (will refresh)
      var callback = {
        OKcallback: {
          method: function (retData, passback) {
            Loading.hide()
            // navigate to Home'
            passback.thiss.$router.replace(passback.thiss.$route.query.redirect || '/')
          },
          params: {thiss: this}
        },
        FAILcallback: {
          method: function (retData, passback) {
            Loading.hide()
            Toast.create('Failed to load project list "' + retData.msg + '"')
          },
          params: {}
        }
      }
      mainJIRADataStore.dispatch('setSelectedProjects', {callback: callback, projects: this.$data.selectedProjects})
    }
  },
  created () {
    Loading.show()
    // slice needed to make sure we copy the array values and don't end up with a reference to the origional object
    this.$data.selectedProjects = mainJIRADataStore.getters.srcJiraData.epicProjects.slice()
    var callback = {
      OKcallback: {
        method: function (retData, passback) {
          Loading.hide()
        },
        params: {}
      },
      FAILcallback: {
        method: function (retData, passback) {
          Loading.hide()
          Toast.create('Failed to load project list "' + retData.msg + '"')
        },
        params: {}
      }
    }
    projectJIRADataStore.dispatch('loadJIRAdata', {callback: callback})
  }
}
</script>

<style>
</style>
