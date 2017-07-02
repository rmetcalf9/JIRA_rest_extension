<template>
  <div>
  
	<h2>Project information page</h2>
	<br>
	<div class="card" v-for="(epic, key) in epics" :key="epic.key">
	<div class="card-title bg-primary text-white">
	  {{ epic.name }}
	</div>
      <div class="list">
        <div v-for="userStory in epic.user_stories" :key="userStory.key">
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
    epics () {
      return mainJIRADataStore.getters.epics
    }
  }
}
</script>

<style>
</style>
