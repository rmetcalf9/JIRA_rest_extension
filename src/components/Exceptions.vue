<template>
  <div>
	<h2>Project Exceptions</h2>
		<table style="margin-top: 30px;" class="q-table bordered striped-odd">
			<thead>
				<tr>
					<th class="text-left">Issue</th>
					<th class="text-left">Message</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="exception in exceptions">
					<td data-th="Issue" class="text-left"><a v-bind:href="issueURLGenerator(exception.key)" target="_new">{{ exception.key }}</a></td>
					<td data-th="Message" class="text-left">{{ exception.msg }}</td>
				</tr>
			</tbody>
		</table>
  </div>
</template>

<script>
import mainJIRADataStore from './mainJIRADataStore'
import JIRAServiceCallStore from './JIRAServiceCallStore'

export default {
  data () {
    return {
    }
  },
  computed: {
    issueURLGenerator () {
      return JIRAServiceCallStore.getters.getIssueURLGenerator
    },
    epic_data () {
      return mainJIRADataStore.state.tmp
    },
    loading_state_txt () {
      return mainJIRADataStore.getters.status_txt
    },
    exceptions () {
      return mainJIRADataStore.getters.exceptions
    }
  }
}
</script>

<style>
</style>
