<template>
  <div>
	<h2 v-if="typeof(sprint) === 'undefined'">Project Progress - {{ totals.progressPercantage }}%</h2>
	<h2 v-if="typeof(sprint) !== 'undefined'">{{ sprint.name }} Progress - {{ totals.progressPercantage }}%</h2>
	<br>
    <q-card v-for="(epic2, key) in epics" :key="epic2.key">
	  <q-card-title class="card-title bg-primary text-white">
	  {{ totals.epicPercentage[epic2.key] }}% -  {{ epic2.name }}
	  </q-card-title>
	  <q-list>
	    <q-item v-for="userStory in epic2.storiesFN()" :key="userStory.key" v-if="(typeof(sprint) === 'undefined') || (sprintid === userStory.sprintid)">
		  <q-item-main>
		    <q-collapsible v-bind:label="userStory.postLoadCaculated.labelText" v-bind:style="(userStory.postLoadCaculated.completed) ? 'color: green' : ''" >
			<div>
			  <q-list>
			    <q-item v-for="task in userStory.tasksFN()" :key="task.key" v-if="task.status !== 'Done'">
				  <q-item-side>
				    <q-item-tile icon="check_box_outline_blank" />
				  </q-item-side>
				  <q-item-main>
			        {{ task.key }} ({{ task.status }}) - {{ task.summary }}
				  </q-item-main>
			    </q-item>
			    <q-item v-for="task in userStory.tasksFN()" :key="task.key" v-if="task.status === 'Done'">
				  <q-item-side>
				    <q-item-tile icon="check_box" />
				  </q-item-side>
				  <q-item-main>
			        {{ task.key }} ({{ task.status }}) - {{ task.summary }}
				  </q-item-main>
			    </q-item>
			  </q-list>
			</div>
			</q-collapsible>
		  </q-item-main>
		</q-item>
	  </q-list>
    </q-card>
  
	<p v-if="typeof(sprint) !== 'undefined'">
	{{ totals.totalBurnedPoints }} out of {{ totals.totalPoints }} points have been burned = {{ totals.progressPercantage }}%
	</p>
  </div>
</template>

<script>
import {
  QCard,
  QCardTitle,
  QBtn,
  QIcon,
  QList,
  QItem,
  QItemMain,
  QItemTile,
  QCollapsible,
  QItemSide
} from 'quasar'
import mainJIRADataStore from './mainJIRADataStore'

export default {
  components: {
    QCard,
    QCardTitle,
    QBtn,
    QIcon,
    QList,
    QItem,
    QItemMain,
    QItemTile,
    QCollapsible,
    QItemSide
  },
  data () {
    return {
    }
  },
  computed: {
    sprintid () {
      return parseInt(this.$route.params.sprintID)
    },
    epics () {
      var x = mainJIRADataStore.getters.project.sprints[this.$route.params.sprintID]
      if (typeof (x) === 'undefined') {
        return mainJIRADataStore.getters.epics
      }
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

      // If x is undefined we are viewing the whole project and can return totals from epics
      if (typeof (x) === 'undefined') {
        mainJIRADataStore.getters.epics.map(function (epic) {
          // console.log(epic.key)
          var epicPercentage = 0
          if ((epic.postLoadCaculated.summedStoryPoints) !== 0) epicPercentage = Math.round((epic.postLoadCaculated.summedBurnedStoryPoints * 100) / epic.postLoadCaculated.summedStoryPoints)
          ret.epicPercentage[epic.key] = epicPercentage
        })
        return ret
      }

      // If x is defined we need to caculate epic percentages for this particular sprint
      var totalPointsSprint = 0
      var burnedPointsSprint = 0
      for (var curEpicID in x.epics) {
        var curEpic = x.epics[curEpicID]
        var totalPointsEpic = 0
        var burnedPointsEpic = 0
        var userStoriesInCurEpic = curEpic.storiesFN()
        var tt = this
        userStoriesInCurEpic.map(function (story) {
          if (story.sprintid === parseInt(tt.$route.params.sprintID)) {
            totalPointsEpic += story.postLoadCaculated.summedStoryPoints
            burnedPointsEpic += story.postLoadCaculated.summedBurnedStoryPoints
          }
        })
        var epicPercentage2 = 0
        if ((totalPointsEpic) !== 0) epicPercentage2 = (Math.round(100 * burnedPointsEpic / totalPointsEpic))
        ret.epicPercentage[curEpic.key] = epicPercentage2
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

<style lang="stylus">
</style>
