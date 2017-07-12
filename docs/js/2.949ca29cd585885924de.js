webpackJsonp([2],{167:function(s,t,e){function i(s){e(185)}var o=e(129)(e(174),e(191),i,null,null);s.exports=o.exports},171:function(s,t,e){"use strict";function i(s,t){console.log("Failed to load JIRA data"),console.log(s),t.commit("ERRORED_LOADING"),t.callback.FAILcallback.method(s,t.callback.FAILcallback.params)}function o(s,t,e,o){var n={OKcallback:{method:function(s,e){for(var i=[],o=0;o<s.length;o++){var n=s[o].fields.customfield_10800,c=s[o].key,l=0;null==s[o].fields.customfield_10004?e.exceptions=a(e.exceptions,s[o].key,"User Story without estimate"):l=s[o].fields.customfield_10004;var u={id:s[o].id,key:c,summary:s[o].fields.summary,description:s[o].fields.description,epickey:n,tasks:[],status:s[o].fields.status.name,label_text:"FILLED IN LATER",story_points:l,summedStoryPoints:0,summedBurnedStoryPoints:0,rank:s[o].fields.customfield_11000};t[n].user_stories[s[o].key]=u,i[c]=n}r(e.commit,t,i,e.callback,e.exceptions)},params:{commit:s,callback:e,exceptions:o}},FAILcallback:{method:i,params:{commit:s,callback:e,exceptions:o}}};l.a.dispatch("query",{jql:"project+%3D+SPI+AND+issuetype+%3D+Story+ORDER+BY+KEY",callback:n})}function a(s,t,e){return s.push({key:t,msg:e}),s}function r(s,t,e,o,r){var n={OKcallback:{method:function(s,t){console.log("Task query response"),console.log(s);for(var i=0;i<s.length;i++)if(void 0===s[i].fields.customfield_11101||null===s[i].fields.customfield_11101)t.exceptions=a(t.exceptions,s[i].key,"Task without userstorykey set");else for(var o=0;o<s[i].fields.customfield_11101.length;o++){var r=s[i].fields.customfield_11101[o];if(void 0===r)t.exceptions=a(t.exceptions,s[i].key,"Task without invalid userstorykey set");else{var n=e[r];t.epics[n].user_stories[r].tasks[s[i].key]={id:s[i].id,key:s[i].key,summary:s[i].fields.summary,description:s[i].fields.description,status:s[i].fields.status.name,story_points:s[i].fields.customfield_10004,rank:s[i].fields.customfield_11000}}}t.commit("SAVE_EPICS",{epics:t.epics,exceptions:t.exceptions}),t.commit("COMPLETED_LOADING"),t.callback.OKcallback.method({msg:"OK"},t.callback.OKcallback.params)},params:{commit:s,callback:o,epics:t,exceptions:r}},FAILcallback:{method:i,params:{commit:s,callback:o,epics:t,exceptions:r}}};l.a.dispatch("query",{jql:"project+%3D+SPI+AND+issuetype+%3D+Task+ORDER+BY+KEY",callback:n})}var n=e(2),c=e(4),l=e(130),u={state:0,epics:[],exceptions:[],project:{progressPercantage:0}},m={START_LOADING:function(s){s.state=1},COMPLETED_LOADING:function(s){s.state=2},ERRORED_LOADING:function(s){s.state=3},SAVE_EPICS:function(s,t){s.epics=[];var e=t.epics,i=0,o=0;for(var r in e){var n=0,c=[];if(void 0!==e[r].key){var l=0,u=0;for(var m in e[r].user_stories){n++;var d=e[r].user_stories[m],p=[],_=d.story_points,k=0,y=0,f=0,v=0;for(var b in e[r].user_stories[m].tasks)f++,null!==e[r].user_stories[m].tasks[b].story_points&&v++,null!==k&&(null===e[r].user_stories[m].tasks[b].story_points?k=null:("Done"===e[r].user_stories[m].tasks[b].status&&(y+=e[r].user_stories[m].tasks[b].story_points),k+=e[r].user_stories[m].tasks[b].story_points)),p.push(e[r].user_stories[m].tasks[b]);v!==f&&(t.exceptions=a(t.exceptions,e[r].user_stories[m].key,"Epic with some but not all Tasks estimated")),0===f?(k=null,e[r].user_stories[m].summedStoryPoints=d.story_points,e[r].user_stories[m].summedBurnedStoryPoints=0):(e[r].user_stories[m].summedStoryPoints=k,e[r].user_stories[m].summedBurnedStoryPoints=y,p=p.sort(function(s,t){return s.rank===t.rank?0:s.rank<t.rank?-1:1})),e[r].user_stories[m].tasks=p,null!==k&&0!==k&&(_=y+"/"+k+" ",_+=Math.round(100*y/k),_+="%"),e[r].user_stories[m].label_text=_+" - "+d.key+" ("+d.status+") "+d.summary,l+=k,u+=y,c.push(e[r].user_stories[m])}e[r].summedStoryPoints=l,e[r].summedBurnedStoryPoints=u,n>1&&(c=c.sort(function(s,t){return s.rank===t.rank?0:s.rank<t.rank?-1:1})),e[r].user_stories=c,s.epics.push(e[r]),i+=l,o+=u}s.project.progressPercantage=0===i?0:Math.round(100*o/i),s.exceptions=t.exceptions}s.epics=s.epics.sort(function(s,t){return s.rank===t.rank?0:s.rank<t.rank?-1:1})}},d={status_txt:function(s,t){return 0===s.state?"Created":1===s.state?"Loading":2===s.state?"Loaded":3===s.state?"Error":"Unknown"},epics:function(s,t){return s.epics},exceptions:function(s,t){return s.exceptions},project:function(s,t){return s.project}},p={loadJIRAdata:function(s,t){var e=s.commit;s.state;e("START_LOADING");var a={OKcallback:{method:function(s,t){console.log("START OF DATA STORE");for(var e=[],i=[],a=0;a<s.length;a++)e[s[a].key]={id:s[a].id,key:s[a].key,name:s[a].fields.customfield_10801,user_stories:[],summedStoryPoints:0,summedBurnedStoryPoints:0,rank:s[a].fields.customfield_11000};o(t.commit,e,t.callback,i)},params:{commit:e,callback:t.callback}},FAILcallback:{method:i,params:{commit:e,callback:t.callback}}};l.a.dispatch("query",{jql:"project+%3D+SPI+AND+issuetype+%3D+Epic+ORDER+BY+KEY",callback:a})}};n.a.use(c.a),t.a=new c.a.Store({state:u,mutations:m,getters:d,actions:p})},174:function(s,t,e){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=e(171);t.default={data:function(){return{}},computed:{epics:function(){return i.a.getters.epics},project:function(){return i.a.getters.project}}}},179:function(s,t,e){t=s.exports=e(163)(void 0),t.push([s.i,"",""])},185:function(s,t,e){var i=e(179);"string"==typeof i&&(i=[[s.i,i,""]]),i.locals&&(s.exports=i.locals);e(164)("7adb73e0",i,!0)},191:function(s,t){s.exports={render:function(){var s=this,t=s.$createElement,e=s._self._c||t;return e("div",[e("h2",[s._v("Project Progress - "+s._s(s.project.progressPercantage)+"%")]),s._v(" "),e("br"),s._v(" "),s._l(s.epics,function(t,i){return e("div",{key:t.key,staticClass:"card"},[0!==t.summedStoryPoints?e("div",{staticClass:"card-title bg-primary text-white"},[s._v("\n\t  "+s._s(Math.round(100*t.summedBurnedStoryPoints/t.summedStoryPoints))+"% -  "+s._s(t.name)+"\n\t")]):s._e(),s._v(" "),0===t.summedStoryPoints?e("div",{staticClass:"card-title bg-primary text-white"},[s._v("\n\t  0% -  "+s._s(t.name)+"\n\t")]):s._e(),s._v(" "),e("div",{staticClass:"list"},s._l(t.user_stories,function(t){return e("div",{key:t.key},[e("q-collapsible",{attrs:{icon:"group",label:t.label_text}},[s._l(t.tasks,function(t){return"Done"!==t.status?e("div",{key:t.key,staticClass:"item has-secondary"},[e("i",{staticClass:"item-primary"},[s._v("check_box_outline_blank")]),s._v(" "),e("div",{staticClass:"item-content"},[s._v("\n                "+s._s(t.key)+" ("+s._s(t.status)+") - "+s._s(t.summary)+"\n              ")]),s._v(" "),e("div",{staticClass:"item-secondary"},[s._v(s._s(t.story_points))])]):s._e()}),s._v(" "),s._l(t.tasks,function(t){return"Done"===t.status?e("div",{key:t.key,staticClass:"item has-secondary"},[e("i",{staticClass:"item-primary"},[s._v("check_box")]),s._v(" "),e("div",{staticClass:"item-content"},[s._v("\n                "+s._s(t.key)+" ("+s._s(t.status)+") - "+s._s(t.summary)+"\n              ")]),s._v(" "),e("div",{staticClass:"item-secondary text-italic",staticStyle:{"text-decoration":"line-through"}},[s._v(s._s(t.story_points))])]):s._e()})],2)],1)}))])})],2)},staticRenderFns:[]}}});