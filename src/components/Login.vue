<template>
  <q-layout>
    <div slot="header" class="toolbar">
      <q-toolbar-title :padding="0">
        {{ pageTitle }}
      </q-toolbar-title>
    </div>

    <div class="layout-view">
        <div class="text-center">
			<br>
			<form>
    	    <p class="caption">Please Login:</p>
    	    <input v-model="username" placeholder="Username">
    	    <br>
    	    <input type="password" v-model="password" placeholder="Password">
			<br>
			<button class="primary small" @click="login">Login</button>
			</form>
        </div>
    </div>
  </q-layout>
</template>

<script>
import { Toast, Loading } from 'quasar'
import globalStore from './globalStore'

export default {
  data () {
    return {
      username: '',
      password: ''
    }
  },
  computed: {
    pageTitle () {
      return globalStore.state.pageTitle
    }
  },
  methods: {
    login () {
      Loading.show()
      var callback = {
        OKcallback: {
          method: function (retData, passback) {
            Loading.hide()
            // Toast.create('Success log in not defined')
            passback.$router.replace(passback.$route.query.redirect || '/')
          },
          params: this
        },
        FAILcallback: {
          method: function (retData, passback) {
            Loading.hide()
            Toast.create('Failed to log in "' + retData.msg + '"')
            console.log(retData)
          },
          params: {}
        }
      }
      var params = {
        username: this.username,
        password: this.password,
        callback: callback
      }
      globalStore.dispatch('loginuser', params)
    }
  },
  created () {
  }
}
</script>

<style>
</style>
