<template>
  <div>
  
	<h2 v-if="typeof(sprint) === 'undefined'">Project Progress - {{ totals.progressPercantage }}%</h2>
	<h2 v-if="typeof(sprint) !== 'undefined'">{{ sprint.name }} Progress - {{ totals.progressPercantage }}%</h2>
	<br>
	<div class="card" v-for="(epic2, key) in epics" :key="epic2.key">
	<div class="card-title bg-primary text-white">
	  {{ totals.epicPercentage[epic2.key] }}% -  {{ epic2.name }}
	</div>
      <div class="list">
        <div v-for="userStory in epic2.user_stories" :key="userStory.key" v-bind:style="(userStory.completed) ? 'color: green' : ''" v-if="(typeof(sprint) === 'undefined') || (sprintid === userStory.sprintid)">
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
	<p v-if="typeof(sprint) !== 'undefined'">
	{{ totals.totalBurnedPoints }} out of {{ totals.totalPoints }} points have been burned = {{ totals.progressPercantage }}%
	</p>
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
    },
    totals () {
      var ret = {
        progressPercantage: mainJIRADataStore.getters.project.progressPercantage,
        totalPoints: 0,
        totalBurnedPoints: 0,
        epicPercentage: []
      }
      var x = mainJIRADataStore.getters.project.sprints[this.$route.params.sprintID]
      if (typeof (x) === 'undefined') {
        var epics = mainJIRADataStore.getters.epics
        for (var epic in epics) {
          var epicPercentage = 0
          if ((epics[epic].summedStoryPoints) !== 0) epicPercentage = Math.round((epics[epic].summedBurnedStoryPoints * 100) / epics[epic].summedStoryPoints)
          ret.epicPercentage[epics[epic].key] = epicPercentage
        }
        return ret
      }
      var totalPointsSprint = 0
      var burnedPointsSprint = 0
      for (var epic2 in x.epics) {
        var totalPointsEpic = 0
        var burnedPointsEpic = 0
        for (var storyKey in x.epics[epic2].user_stories) {
          if (x.epics[epic2].user_stories[storyKey].sprintid === parseInt(this.$route.params.sprintID)) {
            totalPointsEpic += x.epics[epic2].user_stories[storyKey].summedStoryPoints
            burnedPointsEpic += x.epics[epic2].user_stories[storyKey].summedBurnedStoryPoints
          }
        }
        var epicPercentage2 = 0
        if ((totalPointsEpic) !== 0) epicPercentage2 = (Math.round(100 * burnedPointsEpic / totalPointsEpic))
        ret.epicPercentage[x.epics[epic2].key] = epicPercentage2
        totalPointsSprint += totalPointsEpic
        burnedPointsSprint += burnedPointsEpic
      }
      ret.progressPercantage = 0
      if ((totalPointsSprint) !== 0) ret.progressPercantage = (Math.round(100 * burnedPointsSprint / totalPointsSprint))
      ret.totalPoints = totalPointsSprint
      ret.totalBurnedPoints = burnedPointsSprint
      return ret
    }

  }
}
</script>

<style>
</style>
