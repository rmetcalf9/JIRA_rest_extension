webpackJsonp([3],{166:function(t,s,e){function o(t){e(188)}var a=e(129)(e(173),e(194),o,null,null);t.exports=a.exports},171:function(t,s,e){"use strict";function o(t,s){console.log("Failed to load JIRA data"),console.log(t),s.commit("ERRORED_LOADING"),s.callback.FAILcallback.method(t,s.callback.FAILcallback.params)}function a(t,s,e,a){var n={OKcallback:{method:function(t,e){for(var o=[],a=0;a<t.length;a++){var n=t[a].fields.customfield_10800,c=t[a].key,l=0;null==t[a].fields.customfield_10004?e.exceptions=r(e.exceptions,t[a].key,"User Story without estimate"):l=t[a].fields.customfield_10004;var u={id:t[a].id,key:c,summary:t[a].fields.summary,description:t[a].fields.description,epickey:n,tasks:[],status:t[a].fields.status.name,label_text:"FILLED IN LATER",story_points:l,summedStoryPoints:0,summedBurnedStoryPoints:0,rank:t[a].fields.customfield_11000};s[n].user_stories[t[a].key]=u,o[c]=n}i(e.commit,s,o,e.callback,e.exceptions)},params:{commit:t,callback:e,exceptions:a}},FAILcallback:{method:o,params:{commit:t,callback:e,exceptions:a}}};l.a.dispatch("query",{jql:"project+%3D+SPI+AND+issuetype+%3D+Story+ORDER+BY+KEY",callback:n})}function r(t,s,e){return t.push({key:s,msg:e}),t}function i(t,s,e,a,i){var n={OKcallback:{method:function(t,s){console.log("Task query response"),console.log(t);for(var o=0;o<t.length;o++)if(void 0===t[o].fields.customfield_11101||null===t[o].fields.customfield_11101)s.exceptions=r(s.exceptions,t[o].key,"Task without userstorykey set");else for(var a=0;a<t[o].fields.customfield_11101.length;a++){var i=t[o].fields.customfield_11101[a];if(void 0===i)s.exceptions=r(s.exceptions,t[o].key,"Task without invalid userstorykey set");else{var n=e[i];s.epics[n].user_stories[i].tasks[t[o].key]={id:t[o].id,key:t[o].key,summary:t[o].fields.summary,description:t[o].fields.description,status:t[o].fields.status.name,story_points:t[o].fields.customfield_10004,rank:t[o].fields.customfield_11000}}}s.commit("SAVE_EPICS",{epics:s.epics,exceptions:s.exceptions}),s.commit("COMPLETED_LOADING"),s.callback.OKcallback.method({msg:"OK"},s.callback.OKcallback.params)},params:{commit:t,callback:a,epics:s,exceptions:i}},FAILcallback:{method:o,params:{commit:t,callback:a,epics:s,exceptions:i}}};l.a.dispatch("query",{jql:"project+%3D+SPI+AND+issuetype+%3D+Task+ORDER+BY+KEY",callback:n})}var n=e(2),c=e(4),l=e(130),u={state:0,epics:[],exceptions:[],project:{progressPercantage:0}},d={START_LOADING:function(t){t.state=1},COMPLETED_LOADING:function(t){t.state=2},ERRORED_LOADING:function(t){t.state=3},SAVE_EPICS:function(t,s){t.epics=[];var e=s.epics,o=0,a=0;for(var i in e){var n=0,c=[];if(void 0!==e[i].key){var l=0,u=0;for(var d in e[i].user_stories){n++;var m=e[i].user_stories[d],p=[],f=m.story_points,k=0,_=0,y=0,v=0;for(var x in e[i].user_stories[d].tasks)y++,null!==e[i].user_stories[d].tasks[x].story_points&&v++,null!==k&&(null===e[i].user_stories[d].tasks[x].story_points?k=null:("Done"===e[i].user_stories[d].tasks[x].status&&(_+=e[i].user_stories[d].tasks[x].story_points),k+=e[i].user_stories[d].tasks[x].story_points)),p.push(e[i].user_stories[d].tasks[x]);v!==y&&(s.exceptions=r(s.exceptions,e[i].user_stories[d].key,"Epic with some but not all Tasks estimated")),0===y?(k=null,e[i].user_stories[d].summedStoryPoints=m.story_points,e[i].user_stories[d].summedBurnedStoryPoints=0):(e[i].user_stories[d].summedStoryPoints=k,e[i].user_stories[d].summedBurnedStoryPoints=_,p=p.sort(function(t,s){return t.rank===s.rank?0:t.rank<s.rank?-1:1})),e[i].user_stories[d].tasks=p,null!==k&&0!==k&&(f=_+"/"+k+" ",f+=Math.round(100*_/k),f+="%"),e[i].user_stories[d].label_text=f+" - "+m.key+" ("+m.status+") "+m.summary,l+=k,u+=_,c.push(e[i].user_stories[d])}e[i].summedStoryPoints=l,e[i].summedBurnedStoryPoints=u,n>1&&(c=c.sort(function(t,s){return t.rank===s.rank?0:t.rank<s.rank?-1:1})),e[i].user_stories=c,t.epics.push(e[i]),o+=l,a+=u}t.project.progressPercantage=0===o?0:Math.round(100*a/o),t.exceptions=s.exceptions}t.epics=t.epics.sort(function(t,s){return t.rank===s.rank?0:t.rank<s.rank?-1:1})}},m={status_txt:function(t,s){return 0===t.state?"Created":1===t.state?"Loading":2===t.state?"Loaded":3===t.state?"Error":"Unknown"},epics:function(t,s){return t.epics},exceptions:function(t,s){return t.exceptions},project:function(t,s){return t.project}},p={loadJIRAdata:function(t,s){var e=t.commit;t.state;e("START_LOADING");var r={OKcallback:{method:function(t,s){console.log("START OF DATA STORE");for(var e=[],o=[],r=0;r<t.length;r++)e[t[r].key]={id:t[r].id,key:t[r].key,name:t[r].fields.customfield_10801,user_stories:[],summedStoryPoints:0,summedBurnedStoryPoints:0,rank:t[r].fields.customfield_11000};a(s.commit,e,s.callback,o)},params:{commit:e,callback:s.callback}},FAILcallback:{method:o,params:{commit:e,callback:s.callback}}};l.a.dispatch("query",{jql:"project+%3D+SPI+AND+issuetype+%3D+Epic+ORDER+BY+KEY",callback:r})}};n.a.use(c.a),s.a=new c.a.Store({state:u,mutations:d,getters:m,actions:p})},173:function(t,s,e){"use strict";Object.defineProperty(s,"__esModule",{value:!0});var o=e(171);s.default={data:function(){return{}},computed:{epic_data:function(){return o.a.state.tmp},loading_state_txt:function(){return o.a.getters.status_txt},epics:function(){return o.a.getters.epics},exceptions:function(){return o.a.getters.exceptions}}}},182:function(t,s,e){s=t.exports=e(163)(void 0),s.push([t.i,"",""])},188:function(t,s,e){var o=e(182);"string"==typeof o&&(o=[[t.i,o,""]]),o.locals&&(t.exports=o.locals);e(164)("9563fe0a",o,!0)},194:function(t,s){t.exports={render:function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("div",[e("h2",[t._v("Project Exceptions")]),t._v(" "),e("table",{staticClass:"q-table bordered striped-odd",staticStyle:{"margin-top":"30px"}},[t._m(0),t._v(" "),e("tbody",t._l(t.exceptions,function(s){return e("tr",[e("td",{staticClass:"text-left",attrs:{"data-th":"Issue"}},[t._v(t._s(s.key))]),t._v(" "),e("td",{staticClass:"text-left",attrs:{"data-th":"Message"}},[t._v(t._s(s.msg))])])}))])])},staticRenderFns:[function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("thead",[e("tr",[e("th",{staticClass:"text-left"},[t._v("Issue")]),t._v(" "),e("th",{staticClass:"text-left"},[t._v("Message")])])])}]}}});