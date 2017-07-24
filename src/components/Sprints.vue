<template>
  <div>
	<h2>Sprints</h2>
	<div v-for="typ in [{name: 'User Story Sprints', hasStories: true, hasTasks: false},{name: 'Task Sprints', hasStories: false, hasTasks: true}]">
	<h3>{{ typ.name }}</h3>
		<table style="margin-top: 30px;" class="q-table bordered striped-odd">
			<thead>
				<tr>
					<th class="text-left"></th>
					<th class="text-left">Sequence</th>
					<th class="text-left">State</th>
					<th class="text-left">Sprint Name</th>
					<th class="text-left">Start</th>
					<th class="text-left">End</th>
					<th class="text-left">Complete</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="sprint in project.sprints" v-if="(sprint.hasStories === typ.hasStories) && (sprint.hasTasks === typ.hasTasks)">
					<router-link
						tag="div"
						:key="sprint.id"
						class="item item-link item-inset-delimiter"
						:to="'/sprints/' + sprint.id"
					>
						<td data-th="Link" class="text-left">...</td>
					</router-link>
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
