<template>
  <div>
  <h3>Issues</h3>
  <q-data-table
    :data="issuesArray"
    :columns="columns"
    :config="tableConfig"
  >
  </q-data-table>
  <h2>Raw</h2>
  {{ issues }}
  </div>
</template>

<script>
import JIRAServiceCallStore from './JIRAServiceCallStore'
import mainJIRADataStore from './mainJIRADataStore'
import {
  QDataTable
} from 'quasar'

function strSort (a, b) {
  if (a < b) {
    return -1
  }
  if (a > b) {
    return 1
  }
  return 0
}

export default {
  components: {
    QDataTable
  },
  data () {
    return {
      tableConfig: {
        columnPicker: true,
        pagination: {
          rowsPerPage: 15,
          options: [5, 10, 15, 30, 50, 500]
        }
      },
      columns: [
        {
          label: 'Issue Type',
          field: 'issuetype',
          filter: true,
          sort: strSort
        },
        {
          label: 'Key',
          field: 'key',
          filter: true,
          format (value) {
            return '<a href="JIRAServiceCallStore.getters.getIssueURLGenerator(value)" target="_new">' + value + '</a>'
          },
          sort: strSort
        },
        {
          label: 'Status',
          field: 'status',
          filter: true,
          sort: strSort
        },
        {
          label: 'Name',
          field: 'name',
          filter: true,
          sort: strSort
        },
        {
          label: 'Summary',
          field: 'summary',
          filter: true,
          sort: strSort
        },
        {
          label: 'Description',
          field: 'description',
          filter: true,
          sort: strSort
        },
        {
          label: 'Epic',
          field: 'epickey',
          filter: true,
          sort: strSort
        }
      ]
    }
  },
  computed: {
    issueURLGenerator () {
      return JIRAServiceCallStore.getters.getIssueURLGenerator
    },
    issues () {
      console.log('A')
      mainJIRADataStore.getters.issuesArray.map(function (x) {
        var t = x.bugsFN()
        if (t.bugs.length > 0) {
          console.log(x.bugsFN())
        }
      })
      console.log('B')
      return mainJIRADataStore.getters.issues
    },
    issuesArray () {
      return mainJIRADataStore.getters.issuesArray
    }
  }
}
</script>

<style>
</style>
