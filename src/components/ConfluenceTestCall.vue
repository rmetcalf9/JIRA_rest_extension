<template>
  <div>Confluence Test Call<br>
  <br>
  <q-btn color="primary" @click="execute" small>Execute</q-btn>
  <q-btn color="primary" @click="testedit" small>Test Edit</q-btn>
  </div>
</template>

<script>
import {
  QBtn
} from 'quasar'
import confluenceServiceCallStore from './ConfluenceServiceCallStore'
// import mainJIRADataStore from './mainJIRADataStore'

var genericCB = {
  OKcallback: {
    method: function (retData, passback) {
      console.log(retData)
    },
    params: {}
  },
  FAILcallback: {
    method: function (retData, passback) {
      console.log(retData)
    },
    params: {}
  }
}

export default {
  components: {
    QBtn
  },
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
    execute () {
      console.log('Starting test confluence call')
      var jsonToSend = {
        'space': {'key': 'IEW'},
        'type': 'page',
        'title': 'TestPageFromConfluence',
        'body': {
          'storage': {
            'value': '<table class=\'wrapped\'><colgroup><col /><col /><col /><col /></colgroup><tbody><tr><th>Epic</th><th>Stories</th><th>Points</th><th>Progress</th></tr></tbody></table>',
            'representation': 'storage'
          }
        }
      }
      console.log(jsonToSend)

      confluenceServiceCallStore.dispatch('callConfluenceSerivce', {
        apiPath: '/rest/api/content/',
        method: 'post',
        data: jsonToSend,
        callback: genericCB
      })
    },
    testedit () {
      confluenceServiceCallStore.dispatch('callConfluenceSerivce', {
        apiPath: '/rest/api/content/' + '91372836',
        method: 'put',
        data: {
          'version': {
            'number': 5
          },
          'title': 'Test',
          'type': 'page',
          'body': {
            'storage': {
              'value': 'XXXXyyyFROMCONF2',
              'representation': 'storage'
            }
          }
        },
        callback: genericCB
      })
    }
  }
}
</script>

<style>
</style>
