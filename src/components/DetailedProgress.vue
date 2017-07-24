<template>
  <div>
  
	<h2 v-if="typeof(sprint) === 'undefined'">Project Progress - {{ project.progressPercantage }}%</h2>
	<h2 v-if="typeof(sprint) !== 'undefined'">Sprint {{ sprint.name }} Progress - TODO%</h2>
	<br>
	<div class="card" v-for="(epic, key) in epics" :key="epic.key">
	<div class="card-title bg-primary text-white" v-if="epic.summedStoryPoints !== 0">
	  {{Math.round((epic.summedBurnedStoryPoints * 100)/epic.summedStoryPoints) }}% -  {{ epic.name }}
	</div>
	<div class="card-title bg-primary text-white" v-if="epic.summedStoryPoints === 0">
	  0% -  {{ epic.name }}
	</div>
      <div class="list">
        <div v-for="userStory in epic.user_stories" :key="userStory.key" v-if="(typeof(sprint) === 'undefined') || (sprintid === userStory.sprintid)">
          <q-collapsible icon="group" :label="userStory.label_text">
            <div class="item has-secondary" v-for="task in userStory.tasks" :key="task.key" v-if="task.status !== 'Done'">
              <i class="item-primary">check_box_outline_blank</i>
              <div class="item-content">
                {{ task.key }} ({{ task.status }}) - {{ task.summary }}
              </div>
              <div class="item-secondary">{{ task.story_points }}</div>
            </div> 
            <div class="item has-secondary" v-for="task in userStory.tasks" :key="task.key" v-if="task.status === 'Done'">
              <i class="item-primary">check_box</i>
              <div class="item-content">
                {{ task.key }} ({{ task.status }}) - {{ task.summary }}
              </div>
              <div class="item-secondary text-italic" style="text-decoration: line-through;">{{ task.story_points }}</div>
            </div>
          </q-collapsible>
        </div>
      </div> 
    </div>
	</div>
</template>

<script>
import mainJIRADataStore from './mainJIRADataStore'

export default {
  data () {
    return {}
  },
  computed: {
    sprintid () {
      return parseInt(this.$route.params.sprintID)
    },
    epics () {
      var x = mainJIRADataStore.getters.project.sprints[this.$route.params.sprintID]
      if (typeof (x) === 'undefined') return mainJIRADataStore.getters.epics
      return x.epics
    },
    project () {
      return mainJIRADataStore.getters.project
    },
    sprint () {
      var x = mainJIRADataStore.getters.project.sprints[this.$route.params.sprintID]
      // if (typeof(x) === 'undefined') return undefined // Will return undefined for no sprint
      return x
    }

  }
}
</script>

<style>
</style>
