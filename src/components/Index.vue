<template>
  <q-layout>
    <div slot="header" class="toolbar">
      <!-- opens drawer below -->
      <button class="hide-on-drawer-visible" @click="$refs.drawer.open()">
        <i>menu</i>
      </button>
      <button v-if="backroute !== ''" v-go-back.single="backroute" class="within-iframe-hide">
        <i>arrow_back</i>
      </button>
      
      <q-toolbar-title :padding="1">
        {{ pageTitle }}
      </q-toolbar-title>

      <button @click="refresh">
        Refresh
      </button>

	  </div>

    <!-- Drawer -->
    <q-drawer ref="drawer">
      <div class="toolbar light">
        <q-toolbar-title>
          Navigation
        </q-toolbar-title>
      </div>

      <div class="list no-border platform-delimiter">
        <q-drawer-link icon="home" :to="{path: '/', exact: true}">Home</q-drawer-link>
        <q-drawer-link icon="pie_chart" :to="{path: '/progress', exact: true}">Project Progress</q-drawer-link>
        <q-drawer-link icon="bug_report" :to="{path: '/exceptions', exact: true}">Project Exceptions</q-drawer-link>
		<hr>
        <q-drawer-link icon="group_work" :to="{path: '/test', exact: true}">TEST</q-drawer-link>
		<hr>
        <q-drawer-link icon="exit_to_app" :to="{path: '/logout', exact: true}">
          Logout
        </q-drawer-link>
		
      </div>
    </q-drawer>
    

    <router-view class="layout-view"></router-view>

    <!-- Footer -->
    <div slot="footer" class="toolbar"></div>
    

  </q-layout>
</template>

<script>
// import strings from './strings'
import globalStore from './globalStore'
import mainJIRADataStore from './mainJIRADataStore'
import { Loading, Toast } from 'quasar'

export default {
  data () {
    return {
      // app_strings: strings.app
    }
  },
  computed: {
    server_info_load_error_data () {
      return globalStore.state.server_info_load_error_data
    },
    backroute () {
      // console.log(this.$route.path)
      if (this.$route.path === '/') return ''
      var x = this.$route.path.split('/')
      var o = ''
      for (var y in x) {
        if (y < (x.length - 1)) o += '/' + x[y]
      }
      var newPath = o.substring(1)
      return newPath
    },
    pageTitle () {
      return globalStore.state.pageTitle
    }
  },
  created () {
    Loading.show()
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
          Toast.create('Failed to log in "' + retData.msg + '"')
        },
        params: {}
      }
    }
    mainJIRADataStore.dispatch('loadJIRAdata', {callback: callback})
  },
  methods: {
    refresh () {
      Loading.show()
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
            Toast.create('Failed to get data "' + retData.msg + '"')
          },
          params: {}
        }
      }
      mainJIRADataStore.dispatch('loadJIRAdata', {callback: callback})
    }
  }
}

</script>

<style lang="stylus">
.logo-container
  width 192px
  height 268px
  perspective 800px
  position absolute
  top 50%
  left 50%
  transform translateX(-50%) translateY(-50%)
.logo
  position absolute
  transform-style preserve-3d
</style>
