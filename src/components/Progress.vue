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
					<td data-th="Epic" class="text-left"><a v-bind:href="issueURLGenerator(epic.key)">{{ epic.key }}</a> - {{ epic.name }}</td>
					<td data-th="Stories" class="text-right">{{ epic.user_stories.length }}</td>
					<td data-th="Points" class="text-right">{{ epic.summedBurnedStoryPoints }}/{{ epic.summedStoryPoints }}</td>
					<td data-th="Progress" class="text-right" v-if="epic.summedStoryPoints !== 0">{{ Math.round(100 * (epic.summedBurnedStoryPoints / epic.summedStoryPoints)) }}%</td>
					<td data-th="Progress" class="text-right" v-if="epic.summedStoryPoints == 0">0%</td>
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
		<h4>Blockages</h4>
		<p v-if="(blockages.length === 0)">None</p>
		<table style="margin-top: 30px;" class="q-table bordered striped-odd" v-if="(blockages.length !== 0)">
			<thead>
				<tr>
					<th class="text-left">Epic</th>
					<th class="text-left">Story</th>
					<th class="text-left">Blocked Task</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="blockage in blockages">
					<td data-th="Epic" ><a v-bind:href="issueURLGenerator(blockage.Epic.key)">{{ blockage.Epic.name }}</a></td>
					<td data-th="Story"><a v-bind:href="issueURLGenerator(blockage.Story.key)">{{ blockage.Story.key }}</a></td>
					<td data-th="Blocked Task"><a v-bind:href="issueURLGenerator(blockage.Task.key)">{{ blockage.Task.key }}</a> - {{ blockage.Task.summary }}</td>
				</tr>
			</tbody>
		</table>
		<hr>
		<button class="primary small" @click="copy">Update page in confluence</button>
		 <a v-if="(confluencePageContentTitle !== '')" v-bind:href="'https://wiki.imperial.ac.uk/display/IED/' + confluencePageContentTitle">View in Confluence</a>
  </div>
</template>

<script>
import JIRAServiceCallStore from './JIRAServiceCallStore'
import mainJIRADataStore from './mainJIRADataStore'
import confluenceServiceCallStore from './ConfluenceServiceCallStore'
import { Toast } from 'quasar'

function zeroPad (num, places) {
  var zero = places - num.toString().length + 1
  return Array(+(zero > 0 && zero)).join('0') + num
}

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
    epics () {
      return mainJIRADataStore.getters.epics
    },
    exceptions () {
      return mainJIRADataStore.getters.exceptions
    },
    project () {
      return mainJIRADataStore.getters.project
    },
    blockages () {
      return mainJIRADataStore.getters.blockages
    },
    confluencePageContentTitle () {
      if (mainJIRADataStore.getters.srcJiraData.epicProjects[0] === 'SPI') {
        return 'SIMP+Integrations+diary'
      }
      if (mainJIRADataStore.getters.srcJiraData.epicProjects[0] === 'PRJ102') {
        return 'TMP+TO+DELETE'
      }
      return ''
    }
  },
  methods: {
    copy () {
      if (mainJIRADataStore.getters.srcJiraData.epicProjects.length !== 1) {
        Toast.create('Only works when single project is selected')
        return
      }
      console.log(this)
      var pageContentTitle = this.confluencePageContentTitle
      if (pageContentTitle === '') {
        Toast.create('No confluence location for this project')
        return
      }

      var issueURLGenerator = JIRAServiceCallStore.getters.getIssueURLGenerator

      var newBodyString = ''

      var now = new Date()
      var date = zeroPad(now.getFullYear(), 4) + '-' + zeroPad((now.getMonth() + 1), 2) + '-' + zeroPad(now.getDate(), 2)
      var time = zeroPad(now.getHours(), 2) + ':' + zeroPad(now.getMinutes(), 2) + ':' + zeroPad(now.getSeconds(), 2)
      var dateTime = date + ' ' + time

      newBodyString += '<p>Update ' + dateTime + '</p><div class="table-wrap"><table class="wrapped confluenceTable"><colgroup><col/><col/><col/><col/></colgroup><tbody><tr><th class="confluenceTh">Epic</th><th class="confluenceTh">Stories</th><th class="confluenceTh">Points</th><th class="confluenceTh">Progress</th></tr>'

      for (var epicIdx in mainJIRADataStore.getters.epics) {
        var epic = mainJIRADataStore.getters.epics[epicIdx]
        newBodyString += '<tr>'
        newBodyString += '<td><span style="color: rgb(0,0,0);"><a href="' + issueURLGenerator(epic.key) + '">' + epic.key + '</a> - ' + epic.name + '</span></td>'
        newBodyString += '<td style="text-align: right;">' + epic.user_stories.length + '</td>'
        newBodyString += '<td style="text-align: right;">' + epic.summedBurnedStoryPoints + '/' + epic.summedStoryPoints + '</td>'
        if (epic.summedStoryPoints !== 0) {
          newBodyString += '<td style="text-align: right;">' + Math.round(100 * (epic.summedBurnedStoryPoints / epic.summedStoryPoints)) + '%</td>'
        }
        else {
          newBodyString += '<td style="text-align: right;">0%</td>'
        }
        newBodyString += '</tr>'
      }
      newBodyString += '<tr><td>&nbsp;</td>'
      newBodyString += '<td style="text-align: right;"><strong>' + mainJIRADataStore.getters.project.numUserStories + '</strong></td>'
      newBodyString += '<td style="text-align: right;"><strong>' + mainJIRADataStore.getters.project.numBurnedPoints + '/' + mainJIRADataStore.getters.project.numPoints + '</strong></td>'
      newBodyString += '<td style="text-align: right;"><strong>' + mainJIRADataStore.getters.project.progressPercantage + '%</strong></td>'
      newBodyString += '</tr>'
      newBodyString += '</tbody></table></div>'

      newBodyString += '<h2>Blockages</h2>'
      if (mainJIRADataStore.getters.blockages.length === 0) {
        newBodyString += '<p>None</p>'
      }
      else {
        newBodyString += '<table><colgroup><col /><col /><col /><col /></colgroup><tbody>'
        newBodyString += '<tr><th>Epic</th><th>Story</th><th>Blocked Task</th><th>Actions</th></tr>'
        for (var blockageIdx in mainJIRADataStore.getters.blockages) {
          var blockage = mainJIRADataStore.getters.blockages[blockageIdx]
          newBodyString += '<tr>'
          newBodyString += '<td><a href="' + issueURLGenerator(blockage.Epic.key) + '">' + blockage.Epic.name + '</a></td>'
          newBodyString += '<td><a href="' + issueURLGenerator(blockage.Story.key) + '">' + blockage.Story.key + '</a></td>'
          newBodyString += '<td><a href="' + issueURLGenerator(blockage.Task.key) + '">' + blockage.Task.key + '</a> - ' + blockage.Task.summary + '</td>'
          newBodyString += '<td>&nbsp;</td>'
          newBodyString += '</tr>'
        }
        newBodyString += '</tbody></table>'
      }

      var callback = {
        OKcallback: {
          method: function (retData, passback) {
            Toast.create('HTML Data saved to confluence page <a href="' + retData.url + '">' + retData.url + '</a>')
          },
          params: {}
        },
        FAILcallback: {
          method: function (retData, passback) {
            Toast.create('Error updating confluence "' + retData.msg + '"')
          },
          params: {}
        }
      }

      confluenceServiceCallStore.dispatch('updatePage', {
        pageContentTitle: pageContentTitle,
        newPageText: newBodyString,
        callback: callback
      })
    }
  }
}
</script>

<style>
</style>
