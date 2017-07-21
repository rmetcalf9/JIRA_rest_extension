<template>
  <div>
	<h2>Project Progress</h2>
		<table style="margin-top: 30px;" class="q-table bordered striped-odd">
			<thead>
				<tr>
					<th class="text-left">Epic</th>
					<th class="text-left">Stories</th>
					<th class="text-left">Points</th>
					<th class="text-left">Progress</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="epic in epics">
					<td data-th="Epic" class="text-left">{{ epic.key }} - {{ epic.name }}</td>
					<td data-th="Stories" class="text-right">{{ epic.user_stories.length }}</td>
					<td data-th="Points" class="text-right">{{ epic.summedBurnedStoryPoints }}/{{ epic.summedStoryPoints }}</td>
					<td data-th="Points" class="text-right" v-if="epic.summedStoryPoints !== 0">{{ 100 * (epic.summedBurnedStoryPoints / epic.summedStoryPoints) }}%</td>
					<td data-th="Points" class="text-right" v-if="epic.summedStoryPoints == 0">0%</td>
				</tr>
			</tbody>
			<thead>
				<tr>
				    <td/>
					<td class="text-right">{{ project.numUserStories }}</td>
					<td class="text-right">{{ project.numBurnedPoints }}/{{ project.numPoints }}</td>
					<td class="text-right">{{ project.progressPercantage }}%</td>
				</tr>
			</thead>
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
    epic_data () {
      return mainJIRADataStore.state.tmp
    },
    loading_state_txt () {
      return mainJIRADataStore.getters.status_txt
    },
    epics () {
      return mainJIRADataStore.getters.epics
    },
    exceptions () {
      return mainJIRADataStore.getters.exceptions
    },
    project () {
      return mainJIRADataStore.getters.project
    }
  }
}
</script>

<style>
</style>
