<template>
  <div>
	<h2>Sprints</h2>
		<table style="margin-top: 30px;" class="q-table bordered striped-odd">
			<thead>
				<tr>
					<th class="text-left">Sequence</th>
					<th class="text-left">State</th>
					<th class="text-left">Sprint Name</th>
					<th class="text-left">Start</th>
					<th class="text-left">End</th>
					<th class="text-left">Complete</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="sprint in project.sprints">
					<td data-th="Sequence" class="text-left">{{ sprint.sequence }}</td>
					<td data-th="State" class="text-left">{{ sprint.state }}</td>
					<td data-th="Name" class="text-left">{{ sprint.name }}</td>
					<td data-th="Start" class="text-left">{{ sprint.start }}</td>
					<td data-th="End" class="text-left">{{ sprint.end }}</td>
					<td data-th="Complete" class="text-left">{{ sprint.complete }}</td>
				</tr>
			</tbody>
		</table>
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
    project () {
      return mainJIRADataStore.getters.project
    }
  }
}
</script>

<style>
</style>
