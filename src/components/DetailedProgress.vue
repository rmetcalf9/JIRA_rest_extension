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
      // We might consider moving this logic to a postLoadCaculated array inside the sprint
      var tt = this
      var totalsForSprint = x.getEpicsFN().reduce(function (sum, epic) {
        var totalsForEpic = epic.storiesFN().filter(
          function (story) { return story.sprintid === parseInt(tt.$route.params.sprintID) }
        ).reduce(function (sum, story) {
          return {
            totalPoints: sum.totalPoints + story.postLoadCaculated.summedStoryPoints,
            burnedPoints: sum.burnedPoints + story.postLoadCaculated.summedBurnedStoryPoints
          }
        }, { totalPoints: 0, burnedPoints: 0 })
        return {
          totalPoints: sum.totalPoints + totalsForEpic.totalPoints,
          burnedPoints: sum.burnedPoints + totalsForEpic.burnedPoints
        }
      }, { totalPoints: 0, burnedPoints: 0 })
      ret.progressPercantage = 0
      if ((totalsForSprint.totalPoints) !== 0) ret.progressPercantage = (Math.round(100 * totalsForSprint.burnedPoints / totalsForSprint.totalPoints))
      ret.totalPoints = totalsForSprint.totalPoints
      ret.totalBurnedPoints = totalsForSprint.burnedPoints
      return ret
    }
  }
}
</script>

<style lang="stylus">
</style>
