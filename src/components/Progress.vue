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
					<th class="text-left">Bugs Pending</th>
					<th class="text-left">In Progress</th>
					<th class="text-left">Blocked</th>
					<th class="text-left">Resolved</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="epic in epics">
					<td data-th="Epic" class="text-left"><a v-bind:href="issueURLGenerator(epic.key)">{{ epic.key }}</a> - {{ epic.name }}</td>
					<td data-th="Stories" class="text-right">{{ epic.storiesFN().length }}</td>
					<td data-th="Points" class="text-right">{{ epic.postLoadCaculated.summedBurnedStoryPoints }}/{{ epic.postLoadCaculated.summedStoryPoints }}</td>
					<td data-th="Progress" class="text-right" v-if="epic.postLoadCaculated.summedStoryPoints !== 0">{{ Math.round(100 * (epic.postLoadCaculated.summedBurnedStoryPoints / epic.postLoadCaculated.summedStoryPoints)) }}%</td>
					<td data-th="Progress" class="text-right" v-if="epic.postLoadCaculated.summedStoryPoints == 0">0%</td>
					<td data-th="Bugs Pending" class="text-right">{{ epic.postLoadCaculated.bugs.Pending }}</td>
					<td data-th="Bugs In Progress" class="text-right">{{ epic.postLoadCaculated.bugs.InProgress }}</td>
					<td data-th="Bugs Blocked" class="text-right">{{ epic.postLoadCaculated.bugs.Blocked }}</td>
					<td data-th="Bugs Resolved" class="text-right">{{ epic.postLoadCaculated.bugs.Resolved }}</td>
				</tr>
			</tbody>
			<thead>
				<tr>
					<td/>
					<td class="text-right">{{ project.numUserStories }}</td>
					<td class="text-right">{{ project.numBurnedPoints }}/{{ project.numPoints }}</td>
					<td class="text-right">{{ project.progressPercantage }}%</td>
					<td class="text-right">{{ project.bugsPending }}</td>
					<td class="text-right">{{ project.bugsInProgress }}</td>
					<td class="text-right">{{ project.bugsBlocked }}</td>
					<td class="text-right">{{ project.bugsResolved }}</td>
				</tr>
			</thead>
		</table>
		<h4>Blockages</h4>
		<p v-if="(blockages.length === 0)">None</p>
		<table style="margin-top: 30px;" class="q-table bordered striped-odd" v-if="(blockages.length !== 0)">
			<thead>
				<tr>
					<th class="text-left">Assignee</th>
					<th class="text-left">Epic</th>
					<th class="text-left">Story</th>
					<th class="text-left">Blocked Task</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="blockage in blockages">
					<td data-th="Assignee"><div v-if="blockage.Task.assignee === null">Unassigned</div><div v-if="blockage.Task.assignee">
						<img v-bind:src="blockage.Task.assignee.avatarUrls['16x16']" width="16" height="16"/>{{ blockage.Task.assignee.displayName }}
					</div></td>
					<td data-th="Epic" ><a v-bind:href="issueURLGenerator(blockage.Epic.key)">{{ blockage.Epic.name }}</a></td>
					<td data-th="Story">
						<div v-if="blockage.Story.key === 'BUG'">Bug</div>
						<a v-if="blockage.Story.key !== 'BUG'" v-bind:href="issueURLGenerator(blockage.Story.key)">{{ blockage.Story.key }}</a>
					</td>
					<td data-th="Blocked Task"><a v-bind:href="issueURLGenerator(blockage.Task.key)">{{ blockage.Task.key }}</a> - {{ blockage.Task.summary }}</td>
				</tr>
			</tbody>
		</table>
		<hr>
		<q-btn @click="copy" color="primary">
			Update page in confluence
		</q-btn>
		 <a v-if="(confluencePageContentTitle !== '')" v-bind:href="'https://' + confluenceHost + '/display/IED/' + confluencePageContentTitle">View in Confluence</a>
  </div>
</template>

<script>
import JIRAServiceCallStore from './JIRAServiceCallStore'
import mainJIRADataStore from './mainJIRADataStore'
import confluenceServiceCallStore from './ConfluenceServiceCallStore'
import {
  QBtn,
  Toast
} from 'quasar'

function zeroPad (num, places) {
  var zero = places - num.toString().length + 1
  return Array(+(zero > 0 && zero)).join('0') + num
}

export default {
  components: {
    QBtn
  },
  data () {
    return {
    }
  },
  computed: {
    confluenceHost () {
      return confluenceServiceCallStore.getters.host
    },
    issueURLGenerator () {
      return JIRAServiceCallStore.getters.getIssueURLGenerator
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
      if (mainJIRADataStore.getters.srcJiraData.epicProjects[0] === 'SSJ') {
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

      newBodyString += '<p>Update ' + dateTime + '</p><div class="table-wrap"><table class="wrapped confluenceTable"><colgroup><col/><col/><col/><col/></colgroup><tbody>'
      newBodyString += '<tr>'
      newBodyString += '<th class="confluenceTh">Epic</th>'
      newBodyString += '<th class="confluenceTh">Stories</th>'
      newBodyString += '<th class="confluenceTh">Points</th>'
      newBodyString += '<th class="confluenceTh">Progress</th>'
      newBodyString += '<th class="confluenceTh">Bugs Pending</th>'
      newBodyString += '<th class="confluenceTh">In Progress</th>'
      newBodyString += '<th class="confluenceTh">Blocked</th>'
      newBodyString += '<th class="confluenceTh">Resolved</th>'
      newBodyString += '</tr>'

      for (var epicIdx in mainJIRADataStore.getters.epics) {
        var epic = mainJIRADataStore.getters.epics[epicIdx]
        newBodyString += '<tr>'
        newBodyString += '<td><span style="color: rgb(0,0,0);"><a href="' + issueURLGenerator(epic.key) + '" target="_new">' + epic.key + '</a> - ' + epic.name + '</span></td>'
        newBodyString += '<td style="text-align: right;">' + epic.storiesFN().length + '</td>'
        newBodyString += '<td style="text-align: right;">' + epic.postLoadCaculated.summedBurnedStoryPoints + '/' + epic.postLoadCaculated.summedStoryPoints + '</td>'
        if (epic.postLoadCaculated.summedStoryPoints !== 0) {
          newBodyString += '<td style="text-align: right;">' + Math.round(100 * (epic.postLoadCaculated.summedBurnedStoryPoints / epic.postLoadCaculated.summedStoryPoints)) + '%</td>'
        }
        else {
          newBodyString += '<td style="text-align: right;">0%</td>'
        }
        newBodyString += '<td style="text-align: right;">' + epic.postLoadCaculated.bugs.Pending + '</td>'
        newBodyString += '<td style="text-align: right;">' + epic.postLoadCaculated.bugs.InProgress + '</td>'
        newBodyString += '<td style="text-align: right;">' + epic.postLoadCaculated.bugs.Blocked + '</td>'
        newBodyString += '<td style="text-align: right;">' + epic.postLoadCaculated.bugs.Resolved + '</td>'

        newBodyString += '</tr>'
      }
      newBodyString += '<tr><td>&nbsp;</td>'
      newBodyString += '<td style="text-align: right;"><strong>' + mainJIRADataStore.getters.project.numUserStories + '</strong></td>'
      newBodyString += '<td style="text-align: right;"><strong>' + mainJIRADataStore.getters.project.numBurnedPoints + '/' + mainJIRADataStore.getters.project.numPoints + '</strong></td>'
      newBodyString += '<td style="text-align: right;"><strong>' + mainJIRADataStore.getters.project.progressPercantage + '%</strong></td>'

      newBodyString += '<td style="text-align: right;"><strong>' + mainJIRADataStore.getters.project.bugsPending + '</strong></td>'
      newBodyString += '<td style="text-align: right;"><strong>' + mainJIRADataStore.getters.project.bugsInProgress + '</strong></td>'
      newBodyString += '<td style="text-align: right;"><strong>' + mainJIRADataStore.getters.project.bugsBlocked + '</strong></td>'
      newBodyString += '<td style="text-align: right;"><strong>' + mainJIRADataStore.getters.project.bugsResolved + '</strong></td>'

      newBodyString += '</tr>'
      newBodyString += '</tbody></table></div>'

      newBodyString += '<h2>Blockages</h2>'
      if (mainJIRADataStore.getters.blockages.length === 0) {
        newBodyString += '<p>None</p>'
      }
      else {
        newBodyString += '<table><colgroup><col /><col /><col /><col /><col /></colgroup><tbody>'
        newBodyString += '<tr><th>Assignee</th><th>Epic</th><th>Story</th><th>Blocked Task</th><th>Actions</th></tr>'
        for (var blockageIdx in mainJIRADataStore.getters.blockages) {
          var blockage = mainJIRADataStore.getters.blockages[blockageIdx]
          newBodyString += '<tr>'
          newBodyString += '<td>'
          if (blockage.Task.assignee) {
            newBodyString += blockage.Task.assignee.displayName
          }
          else {
            newBodyString += 'Unassigned'
          }
          newBodyString += '</td>'
          newBodyString += '<td><a href="' + issueURLGenerator(blockage.Epic.key) + '">' + blockage.Epic.name + '</a></td>'
          if (blockage.Story.key === 'BUG') {
            newBodyString += '<td>Bug</td>'
          }
          else {
            newBodyString += '<td><a href="' + issueURLGenerator(blockage.Story.key) + '">' + blockage.Story.key + '</a></td>'
          }
          newBodyString += '<td><a href="' + issueURLGenerator(blockage.Task.key) + '">' + blockage.Task.key + '</a> - ' + blockage.Task.summary + '</td>'
          newBodyString += '<td>&nbsp;</td>'
          newBodyString += '</tr>'
        }
        newBodyString += '</tbody></table>'
      }
      // console.log(newBodyString)

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
