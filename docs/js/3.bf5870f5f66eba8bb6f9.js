webpackJsonp([3],{171:function(t,e,r){function s(t){r(237)}var n=r(129)(r(218),r(246),s,null,null);t.exports=n.exports},174:function(t,e){var r=t.exports={version:"2.4.0"};"number"==typeof __e&&(__e=r)},175:function(t,e,r){t.exports=!r(176)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},176:function(t,e){t.exports=function(t){try{return!!t()}catch(t){return!0}}},177:function(t,e){var r=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=r)},178:function(t,e){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},179:function(t,e){t.exports=function(t){if(void 0==t)throw TypeError("Can't call method on  "+t);return t}},180:function(t,e){var r=Math.ceil,s=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?s:r)(t)}},181:function(t,e,r){var s=r(197),n=r(179);t.exports=function(t){return s(n(t))}},182:function(t,e,r){"use strict";e.a={joinStringArray:function(t,e){if(void 0===e&&(e=""),0===t.length)return"";if(1===t.length)return t[0];var r="";for(var s in t)r+=t[s]+e;return r.substr(0,r.length-e.length)},getIssueRetervialJQLArrayCriteria:function(t,e,r){r.length>0&&(1===r.length?t.push(e+"+%3D+"+r[0]):t.push(e+"+IN+("+this.joinStringArray(r,",")+")"))},getIssueRetervialJQL:function(t,e){var r=[];return this.getIssueRetervialJQLArrayCriteria(r,"project",t),this.getIssueRetervialJQLArrayCriteria(r,"issuetype",e),this.joinStringArray(r,"+AND+")+"+ORDER+BY+KEY"}}},183:function(t,e,r){"use strict";function s(t,e,r){var s=new Date("31-DEC-4712"),n=new Date("31-DEC-4712");null!==r.sprintid&&(s=t.sprints[r.sprintid].end),null!==e.sprintid&&(n=t.sprints[e.sprintid].end),s<n&&(null===e.sprintid?t.exceptions=a(t.exceptions,e.key,"Task not in sprint but associated user story needs to be delivered on "+s):t.exceptions=a(t.exceptions,e.key,"Task scheduled to be delivered after story"))}function n(t){p()(t.sprints).map(function(e,r){var s=t.sprints[e];s.hasTasks&&s.hasStories&&(t.exceptions=a(t.exceptions,"Sprint "+s.id,"Sprint has both tasks and stories")),s.hasTasks||s.hasStories||(t.exceptions=a(t.exceptions,"Sprint "+s.id,"Sprint has neither tasks nor stories"))})}function o(t,e){console.log("Failed to load JIRA data"),console.log(t),e.commit("ERRORED_LOADING"),e.callback.FAILcallback.method(t,e.callback.FAILcallback.params)}function i(t,e,r){var s={OKcallback:{method:function(t,e){for(var r=[],s=0;s<t.length;s++){var n=t[s].fields.customfield_10800;if("string"!=typeof n)e.forGlobalState.exceptions=a(e.forGlobalState.exceptions,t[s].key,"User story with no Epic set");else{var o=t[s].key,i=0;null==t[s].fields.customfield_10004?e.forGlobalState.exceptions=a(e.forGlobalState.exceptions,t[s].key,"User Story without estimate"):i=t[s].fields.customfield_10004;var u=l(t[s].fields.customfield_10501,t[s].key,e.forGlobalState,"Story",e.forGlobalState.epics[n]),f={id:t[s].id,key:o,summary:t[s].fields.summary,description:t[s].fields.description,epickey:n,tasks:[],status:t[s].fields.status.name,label_text:"FILLED IN LATER",story_points:i,summedStoryPoints:0,summedBurnedStoryPoints:0,rank:t[s].fields.customfield_11000,sprintid:u,completed:!1};e.forGlobalState.epics[n].user_stories[t[s].key]=f,r[o]=n}}c(e.commit,r,e.callback,e.forGlobalState)},params:{commit:t,callback:r,forGlobalState:e}},FAILcallback:{method:o,params:{commit:t,callback:r}}};y.a.dispatch("query",{jql:_.a.getIssueRetervialJQL(e.state.srcJiraData.storyProjects,["Story"]),callback:s})}function a(t,e,r){return t.push({key:e,msg:r}),t}function c(t,e,r,s){var n={OKcallback:{method:function(t,r){for(var n=0;n<t.length;n++)if(void 0===t[n].fields.customfield_11101||null===t[n].fields.customfield_11101)r.forGlobalState.exceptions=a(r.forGlobalState.exceptions,t[n].key,"Task without userstorykey set");else for(var o=0;o<t[n].fields.customfield_11101.length;o++){var i=t[n].fields.customfield_11101[o];if(void 0===i)r.forGlobalState.exceptions=a(r.forGlobalState.exceptions,t[n].key,"Task without invalid userstorykey set");else{var c=e[i];r.forGlobalState.epics[c].user_stories[i].tasks[t[n].key]={id:t[n].id,key:t[n].key,summary:t[n].fields.summary,description:t[n].fields.description,status:t[n].fields.status.name,story_points:t[n].fields.customfield_10004,rank:t[n].fields.customfield_11000,sprintid:l(t[n].fields.customfield_10501,t[n].key,r.forGlobalState,"Task",void 0)}}}r.commit("SAVE_EPICS",{forGlobalState:s}),r.commit("COMPLETED_LOADING"),r.callback.OKcallback.method({msg:"OK"},r.callback.OKcallback.params)},params:{commit:t,callback:r,forGlobalState:s}},FAILcallback:{method:o,params:{commit:t,callback:r}}};y.a.dispatch("query",{jql:_.a.getIssueRetervialJQL(s.state.srcJiraData.taskProjects,["Task"]),callback:n})}function u(t){var e=t.search("\\[id="),r=t.substr(e+1,t.length-(e+2)).split(",");r=r.map(function(t){var e=t.split("=");return{name:e[0],value:e[1]}});var s=function(t){var e=null;return r.forEach(function(r){r.name===t&&(e=r.value)}),e};return{id:parseInt(s("id")),name:s("name"),state:s("state"),start:new Date(s("startDate")),end:new Date(s("endDate")),complete:s("completeDate"),sequence:s("sequence"),hasTasks:!1,hasStories:!1,epics:[],epicsKeys:{}}}function l(t,e,r,s,n){if(null===t)return null;if(0===t.length)return null;var o=null;for(var i in t){var a=u(t[i]);void 0===r.sprints[a.id]&&(r.sprints[a.id]=a),null===o?o=a:a.start>o.start&&(o=a)}return"Task"===s?r.sprints[o.id].hasTasks=!0:"Story"===s&&(r.sprints[o.id].hasStories=!0),void 0!==n&&void 0===r.sprints[o.id].epicsKeys[n.key]&&(r.sprints[o.id].epics.push(n),r.sprints[o.id].epicsKeys[n.key]=n.key),o.id}var f=r(184),p=r.n(f),d=r(2),m=r(4),y=r(130),_=r(182),v={state:0,epics:[],exceptions:[],project:{progressPercantage:0,numUserStories:0,numPoints:0,numBurnedPoints:0,sprints:{}},srcJiraData:{epicProjects:["SPI"],storyProjects:["SPI"],taskProjects:["SPI"]}},k={START_LOADING:function(t){t.state=1},COMPLETED_LOADING:function(t){t.state=2},ERRORED_LOADING:function(t){t.state=3},SAVE_EPICS:function(t,e){t.epics=[];var r=e.forGlobalState.epics,o=0,i=0,c=0;for(var u in r){var l=0,f=[];if(void 0===r[u].key)console.log("ERROR Epic with Undefined key");else{var p=0,d=0;for(var m in r[u].user_stories){l++;var y=r[u].user_stories[m],_=[],v=y.story_points,k=0,h=0,b=0,S=0;for(var x in r[u].user_stories[m].tasks)b++,null!==r[u].user_stories[m].tasks[x].story_points&&S++,null!==k&&(null===r[u].user_stories[m].tasks[x].story_points?k=null:("Done"===r[u].user_stories[m].tasks[x].status&&(h+=r[u].user_stories[m].tasks[x].story_points),k+=r[u].user_stories[m].tasks[x].story_points)),s(e.forGlobalState,r[u].user_stories[m].tasks[x],r[u].user_stories[m]),_.push(r[u].user_stories[m].tasks[x]);S!==b&&(e.forGlobalState.exceptions=a(e.forGlobalState.exceptions,r[u].user_stories[m].key,"Story with some but not all Tasks estimated")),0===b?(k=null,r[u].user_stories[m].summedStoryPoints=y.story_points,r[u].user_stories[m].summedBurnedStoryPoints=0):(r[u].user_stories[m].summedStoryPoints=k,y.story_points>k&&(r[u].user_stories[m].summedStoryPoints=y.story_points),r[u].user_stories[m].summedBurnedStoryPoints=h,_=_.sort(function(t,e){return t.rank===e.rank?0:t.rank<e.rank?-1:1})),null!==y.sprintid&&k!==y.story_points&&(e.forGlobalState.exceptions=a(e.forGlobalState.exceptions,r[u].user_stories[m].key,"Story in sprint but estimate ("+y.story_points+") dosen't match sum of task story points ("+k+")")),r[u].user_stories[m].tasks=_,null!==k&&0!==k&&(v=h+"/"+k+" ",v+=Math.round(100*h/k),v+="%"),r[u].user_stories[m].label_text=v+" - "+y.key+" ("+y.status+") "+y.summary,r[u].user_stories[m].completed=h===k,p+=r[u].user_stories[m].summedStoryPoints,d+=r[u].user_stories[m].summedBurnedStoryPoints,f.push(r[u].user_stories[m])}r[u].summedStoryPoints=p,r[u].summedBurnedStoryPoints=d,l>1&&(f=f.sort(function(t,e){return t.rank===e.rank?0:t.rank<e.rank?-1:1})),r[u].user_stories=f,t.epics.push(r[u]),o+=p,i+=d}c+=l}t.project.progressPercantage=0===o?0:Math.round(100*i/o),n(e.forGlobalState),t.project.numUserStories=c,t.project.numPoints=o,t.project.numBurnedPoints=i,t.exceptions=e.forGlobalState.exceptions,t.stories=e.forGlobalState.stories,t.project.sprints=e.forGlobalState.sprints,t.epics=t.epics.sort(function(t,e){return t.rank===e.rank?0:t.rank<e.rank?-1:1});for(var g in t.project.sprints)t.project.sprints[g].epics=t.project.sprints[g].epics.sort(function(t,e){return t.rank===e.rank?0:t.rank<e.rank?-1:1})},SAVE_JIRADATA:function(t,e){t.srcJiraData=e.srcJiraData}},h={status_txt:function(t,e){return 0===t.state?"Created":1===t.state?"Loading":2===t.state?"Loaded":3===t.state?"Error":"Unknown"},epics:function(t,e){return t.epics},exceptions:function(t,e){return t.exceptions},project:function(t,e){return t.project},srcJiraData:function(t,e){return t.srcJiraData}},b={setSelectedProjects:function(t,e){if(_.a.joinStringArray(v.srcJiraData.epicProjects)===_.a.joinStringArray(e.projects))return void e.callback.OKcallback.method({msg:"OK"},e.callback.OKcallback.params);t.commit("SAVE_JIRADATA",{srcJiraData:{epicProjects:e.projects,storyProjects:e.projects,taskProjects:e.projects}});var r={OKcallback:{method:function(t,r){e.callback.OKcallback.method({msg:"OK"},e.callback.OKcallback.params)},params:{}},FAILcallback:{method:o,params:{commit:t.commit,callback:e.callback}}};t.dispatch("loadJIRAdata",{callback:r})},loadJIRAdata:function(t,e){var r=t.commit,s=t.state;r("START_LOADING");var n={OKcallback:{method:function(t,e){for(var r={epics:[],exceptions:[],sprints:{},state:s},n=0;n<t.length;n++)r.epics[t[n].key]={id:t[n].id,key:t[n].key,name:t[n].fields.customfield_10801,user_stories:[],summedStoryPoints:0,summedBurnedStoryPoints:0,rank:t[n].fields.customfield_11000};i(e.commit,r,e.callback)},params:{state:s,commit:r,callback:e.callback}},FAILcallback:{method:o,params:{commit:r,callback:e.callback}}};y.a.dispatch("query",{jql:_.a.getIssueRetervialJQL(s.srcJiraData.epicProjects,["Epic"]),callback:n})}};d.a.use(m.a),e.a=new m.a.Store({state:v,mutations:k,getters:h,actions:b})},184:function(t,e,r){t.exports={default:r(185),__esModule:!0}},185:function(t,e,r){r(210),t.exports=r(174).Object.keys},186:function(t,e){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},187:function(t,e,r){var s=r(178);t.exports=function(t){if(!s(t))throw TypeError(t+" is not an object!");return t}},188:function(t,e,r){var s=r(181),n=r(206),o=r(205);t.exports=function(t){return function(e,r,i){var a,c=s(e),u=n(c.length),l=o(i,u);if(t&&r!=r){for(;u>l;)if((a=c[l++])!=a)return!0}else for(;u>l;l++)if((t||l in c)&&c[l]===r)return t||l||0;return!t&&-1}}},189:function(t,e){var r={}.toString;t.exports=function(t){return r.call(t).slice(8,-1)}},190:function(t,e,r){var s=r(186);t.exports=function(t,e,r){if(s(t),void 0===e)return t;switch(r){case 1:return function(r){return t.call(e,r)};case 2:return function(r,s){return t.call(e,r,s)};case 3:return function(r,s,n){return t.call(e,r,s,n)}}return function(){return t.apply(e,arguments)}}},191:function(t,e,r){var s=r(178),n=r(177).document,o=s(n)&&s(n.createElement);t.exports=function(t){return o?n.createElement(t):{}}},192:function(t,e){t.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},193:function(t,e,r){var s=r(177),n=r(174),o=r(190),i=r(195),a=function(t,e,r){var c,u,l,f=t&a.F,p=t&a.G,d=t&a.S,m=t&a.P,y=t&a.B,_=t&a.W,v=p?n:n[e]||(n[e]={}),k=v.prototype,h=p?s:d?s[e]:(s[e]||{}).prototype;p&&(r=e);for(c in r)(u=!f&&h&&void 0!==h[c])&&c in v||(l=u?h[c]:r[c],v[c]=p&&"function"!=typeof h[c]?r[c]:y&&u?o(l,s):_&&h[c]==l?function(t){var e=function(e,r,s){if(this instanceof t){switch(arguments.length){case 0:return new t;case 1:return new t(e);case 2:return new t(e,r)}return new t(e,r,s)}return t.apply(this,arguments)};return e.prototype=t.prototype,e}(l):m&&"function"==typeof l?o(Function.call,l):l,m&&((v.virtual||(v.virtual={}))[c]=l,t&a.R&&k&&!k[c]&&i(k,c,l)))};a.F=1,a.G=2,a.S=4,a.P=8,a.B=16,a.W=32,a.U=64,a.R=128,t.exports=a},194:function(t,e){var r={}.hasOwnProperty;t.exports=function(t,e){return r.call(t,e)}},195:function(t,e,r){var s=r(198),n=r(202);t.exports=r(175)?function(t,e,r){return s.f(t,e,n(1,r))}:function(t,e,r){return t[e]=r,t}},196:function(t,e,r){t.exports=!r(175)&&!r(176)(function(){return 7!=Object.defineProperty(r(191)("div"),"a",{get:function(){return 7}}).a})},197:function(t,e,r){var s=r(189);t.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return"String"==s(t)?t.split(""):Object(t)}},198:function(t,e,r){var s=r(187),n=r(196),o=r(208),i=Object.defineProperty;e.f=r(175)?Object.defineProperty:function(t,e,r){if(s(t),e=o(e,!0),s(r),n)try{return i(t,e,r)}catch(t){}if("get"in r||"set"in r)throw TypeError("Accessors not supported!");return"value"in r&&(t[e]=r.value),t}},199:function(t,e,r){var s=r(194),n=r(181),o=r(188)(!1),i=r(203)("IE_PROTO");t.exports=function(t,e){var r,a=n(t),c=0,u=[];for(r in a)r!=i&&s(a,r)&&u.push(r);for(;e.length>c;)s(a,r=e[c++])&&(~o(u,r)||u.push(r));return u}},200:function(t,e,r){var s=r(199),n=r(192);t.exports=Object.keys||function(t){return s(t,n)}},201:function(t,e,r){var s=r(193),n=r(174),o=r(176);t.exports=function(t,e){var r=(n.Object||{})[t]||Object[t],i={};i[t]=e(r),s(s.S+s.F*o(function(){r(1)}),"Object",i)}},202:function(t,e){t.exports=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}}},203:function(t,e,r){var s=r(204)("keys"),n=r(209);t.exports=function(t){return s[t]||(s[t]=n(t))}},204:function(t,e,r){var s=r(177),n=s["__core-js_shared__"]||(s["__core-js_shared__"]={});t.exports=function(t){return n[t]||(n[t]={})}},205:function(t,e,r){var s=r(180),n=Math.max,o=Math.min;t.exports=function(t,e){return t=s(t),t<0?n(t+e,0):o(t,e)}},206:function(t,e,r){var s=r(180),n=Math.min;t.exports=function(t){return t>0?n(s(t),9007199254740991):0}},207:function(t,e,r){var s=r(179);t.exports=function(t){return Object(s(t))}},208:function(t,e,r){var s=r(178);t.exports=function(t,e){if(!s(t))return t;var r,n;if(e&&"function"==typeof(r=t.toString)&&!s(n=r.call(t)))return n;if("function"==typeof(r=t.valueOf)&&!s(n=r.call(t)))return n;if(!e&&"function"==typeof(r=t.toString)&&!s(n=r.call(t)))return n;throw TypeError("Can't convert object to primitive value")}},209:function(t,e){var r=0,s=Math.random();t.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++r+s).toString(36))}},210:function(t,e,r){var s=r(207),n=r(200);r(201)("keys",function(){return function(t){return n(s(t))}})},218:function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var s=r(183);e.default={data:function(){return{}},computed:{epic_data:function(){return s.a.state.tmp},loading_state_txt:function(){return s.a.getters.status_txt},epics:function(){return s.a.getters.epics},exceptions:function(){return s.a.getters.exceptions},project:function(){return s.a.getters.project}}}},228:function(t,e,r){e=t.exports=r(163)(void 0),e.push([t.i,"",""])},237:function(t,e,r){var s=r(228);"string"==typeof s&&(s=[[t.i,s,""]]),s.locals&&(t.exports=s.locals);r(164)("4ec481ae",s,!0)},246:function(t,e){t.exports={render:function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",[r("h2",[t._v("Project Progress")]),t._v(" "),r("table",{staticClass:"q-table bordered striped-odd",staticStyle:{"margin-top":"30px"}},[t._m(0),t._v(" "),r("tbody",t._l(t.epics,function(e){return r("tr",[r("td",{staticClass:"text-left",attrs:{"data-th":"Epic"}},[t._v(t._s(e.key)+" - "+t._s(e.name))]),t._v(" "),r("td",{staticClass:"text-right",attrs:{"data-th":"Stories"}},[t._v(t._s(e.user_stories.length))]),t._v(" "),r("td",{staticClass:"text-right",attrs:{"data-th":"Points"}},[t._v(t._s(e.summedBurnedStoryPoints)+"/"+t._s(e.summedStoryPoints))]),t._v(" "),0!==e.summedStoryPoints?r("td",{staticClass:"text-right",attrs:{"data-th":"Progress"}},[t._v(t._s(Math.round(e.summedBurnedStoryPoints/e.summedStoryPoints*100))+"%")]):t._e(),t._v(" "),0==e.summedStoryPoints?r("td",{staticClass:"text-right",attrs:{"data-th":"Progress"}},[t._v("0%")]):t._e()])})),t._v(" "),r("thead",[r("tr",[r("td"),t._v(" "),r("td",{staticClass:"text-right"},[t._v(t._s(t.project.numUserStories))]),t._v(" "),r("td",{staticClass:"text-right"},[t._v(t._s(t.project.numBurnedPoints)+"/"+t._s(t.project.numPoints))]),t._v(" "),r("td",{staticClass:"text-right"},[t._v(t._s(t.project.progressPercantage)+"%")])])])])])},staticRenderFns:[function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("thead",[r("tr",[r("th",{staticClass:"text-left"},[t._v("Epic")]),t._v(" "),r("th",{staticClass:"text-left"},[t._v("Stories")]),t._v(" "),r("th",{staticClass:"text-left"},[t._v("Points")]),t._v(" "),r("th",{staticClass:"text-left"},[t._v("Progress")])])])}]}}});