webpackJsonp([10],[,,,,,,,,,,function(a,e,t){"use strict";function s(a,e,t){var o={OKcallback:{method:function(o,c){o.data.total>o.data.startAt+o.data.maxResults?s(a,e,t.concat(o.data.issues)):c.OKcallback.method(t.concat(o.data.issues),c.OKcallback.params)},params:e.callback},FAILcallback:{method:function(a,e){e.FAILcallback.method(a,e.FAILcallback.params)},params:e.callback}};a("callGetService",{URLPath:"/rest/api/2/search?jql="+e.jql+"&maxResults=100&startAt="+t.length,callback:o})}function o(a,e,t,s){var o={headers:{"Content-Type":"application/json",Authorization:s}};l.a.get(a.corsproxyprefix+a.host+e,o).then(function(a){a.status<200?t.FAILcallback.method({msg:"Bad status",response:a},t.FAILcallback.params):a.status>299?t.FAILcallback.method({msg:"Bad status",response:a},t.FAILcallback.params):t.OKcallback.method(a,t.OKcallback.params)}).catch(function(a){void 0===a.response?void 0===a.message?t.FAILcallback.method({msg:"Bad Response UNKNOWN",response:a},t.FAILcallback.params):(console.log(a),t.FAILcallback.method({msg:"Bad Response "+a.message,response:a},t.FAILcallback.params)):void 0!==a.response.data?void 0!==a.response.data.errorMessages?t.FAILcallback.method({msg:"Bad Response("+a.response.data.errorMessages.length+") "+a.response.data.errorMessages,response:a.response},t.FAILcallback.params):t.FAILcallback.method({msg:"Data Bad Response "+a.response.status,response:a.response},t.FAILcallback.params):t.FAILcallback.method({msg:"Nested Bad Response "+a.response.status,response:a.response},t.FAILcallback.params)})}var c=t(1),n=t(2),r=t(4),l=t.n(r),i={corsproxyprefix:"http://cc-rjmetcal.ic.ac.uk:1337/",host:"jira.cc.ic.ac.uk",authkey:""},p={SETAUTHKEY:function(a,e){a.authkey=e},CLEARAUTHKEY:function(a){a.authkey=""}},u={isAuthKeySet:function(a,e){return""!==a.authkey},getIssueURLGenerator:function(a,e){return function(e){return"https://"+a.host+"/browse/"+e}}},m={setAuthKey:function(a,e){var t=a.commit,s=a.state,c=e.authToken;o(s,"/rest/api/2/myself",{OKcallback:{method:function(a,e){e.commit("SETAUTHKEY",e.authkey),e.callback.OKcallback.method(a,e.callback.OKcallback.params)},params:{callback:e.callback,authkey:c,commit:t}},FAILcallback:{method:function(a,e){e.FAILcallback.method(a,e.FAILcallback.params)},params:e.callback}},c)},callGetService:function(a,e){var t=(a.commit,a.state);o(t,e.URLPath,e.callback,t.authkey)},query:function(a,e){s(a.dispatch,e,[])}};c.a.use(n.a),e.a=new n.a.Store({state:i,mutations:p,getters:u,actions:m})},,,function(a,e,t){"use strict";var s=t(1),o=t(2),c=t(10),n=t(14),r={pageTitle:"Default Page Title"},l={SET_PAGE_TITLE:function(a,e){a.pageTitle="JIRA rest extenstions by RJM - "+e},LOGOUT:function(a){c.a.commit("CLEARAUTHKEY")}},i={is_logged_in:function(a,e){return c.a.getters.isAuthKeySet}},p={loginuser:function(a,e){var t=(a.commit,btoa(e.username+":"+e.password));c.a.dispatch("setAuthKey",{authToken:"Basic "+t,callback:e.callback}),n.a.dispatch("setAuthKey",{authToken:"Basic "+t,callback:e.callback})}};s.a.use(o.a),e.a=new o.a.Store({state:r,mutations:l,getters:i,actions:p})},function(a,e,t){"use strict";function s(a,e){console.log("Failed when calling confluence"),console.log(a),e.callback.FAILcallback.method(a,e.callback.FAILcallback.params)}function o(a,e){var t=a.body;return t.storage.value=e+"<hr />"+t.storage.value,{version:{number:a.version.number+1,message:"Automatic upate from JIRA rest extentions by RJM"},title:a.title,type:a.type,body:t}}function c(a,e,t,s){var o={headers:{"Content-Type":"application/json",Authorization:s}};u.a.get(a.corsproxyprefix+a.host+e,o).then(function(a){a.status<200?t.FAILcallback.method({msg:"Bad status",response:a},t.FAILcallback.params):a.status>299?t.FAILcallback.method({msg:"Bad status",response:a},t.FAILcallback.params):t.OKcallback.method(a,t.OKcallback.params)}).catch(function(a){void 0===a.response?void 0===a.message?t.FAILcallback.method({msg:"Bad Response UNKNOWN",response:a},t.FAILcallback.params):(console.log(a),t.FAILcallback.method({msg:"Bad Response "+a.message,response:a},t.FAILcallback.params)):void 0!==a.response.data?void 0!==a.response.data.errorMessages?t.FAILcallback.method({msg:"Bad Response("+a.response.data.errorMessages.length+") "+a.response.data.errorMessages,response:a.response},t.FAILcallback.params):t.FAILcallback.method({msg:"Data Bad Response "+a.response.status,response:a.response},t.FAILcallback.params):t.FAILcallback.method({msg:"Nested Bad Response "+a.response.status,response:a.response},t.FAILcallback.params)})}function n(a,e,t,s){return"post"===s?u.a.post(a,e,t):"put"===s?u.a.put(a,e,t):void 0}function r(a,e,t,s,o,c){var r={headers:{"Content-Type":"application/json",Authorization:o}};n(a.corsproxyprefix+a.host+e,t,r,c).then(function(a){a.status<200?s.FAILcallback.method({msg:"Bad status",response:a},s.FAILcallback.params):a.status>299?s.FAILcallback.method({msg:"Bad status",response:a},s.FAILcallback.params):s.OKcallback.method(a,s.OKcallback.params)}).catch(function(a){void 0===a.response?void 0===a.message?s.FAILcallback.method({msg:"Bad Response UNKNOWN",response:a},s.FAILcallback.params):(console.log(a),s.FAILcallback.method({msg:"Bad Response "+a.message,response:a},s.FAILcallback.params)):void 0!==a.response.data?void 0!==a.response.data.errorMessages?s.FAILcallback.method({msg:"Bad Response("+a.response.data.errorMessages.length+") "+a.response.data.errorMessages,response:a.response},s.FAILcallback.params):s.FAILcallback.method({msg:"Data Bad Response "+a.response.status,response:a.response},s.FAILcallback.params):s.FAILcallback.method({msg:"Nested Bad Response "+a.response.status,response:a.response},s.FAILcallback.params)})}var l=t(1),i=t(2),p=t(4),u=t.n(p),m={corsproxyprefix:"http://cc-rjmetcal.ic.ac.uk:1337/",host:"wiki.imperial.ac.uk",authkey:""},d={SETAUTHKEY:function(a,e){a.authkey=e},CLEARAUTHKEY:function(a){a.authkey=""}},h={isAuthKeySet:function(a,e){return""!==a.authkey},host:function(a,e){return a.host}},k={setAuthKey:function(a,e){var t=a.commit,s=a.state,o=e.authToken;c(s,"/rest/api/user/current",{OKcallback:{method:function(a,e){e.commit("SETAUTHKEY",e.authkey),e.callback.OKcallback.method(a,e.callback.OKcallback.params)},params:{callback:e.callback,authkey:o,commit:t}},FAILcallback:{method:function(a,e){e.FAILcallback.method(a,e.FAILcallback.params)},params:e.callback}},o)},callConfluenceSerivce:function(a,e){"get"===e.method?c(a.state,e.apiPath,e.callback,a.state.authkey):r(a.state,e.apiPath,e.data,e.callback,a.state.authkey,e.method)},updatePage:function(a,e){var t={OKcallback:{method:function(e,t){if(1!==e.data.size)return console.log(e),void t.callback.FAILcallback.method({msg:"Didnt get single result",response:e},t.callback.FAILcallback.params);var c=e.data.results[0].id,n=o(e.data.results[0],t.newPageText),r={OKcallback:{method:function(e,t){t.callback.OKcallback.method({msg:"OK",url:"https://"+a.state.host+"/display/IED/"+t.pageContentTitle},t.callback.OKcallback.params)},params:t},FAILcallback:{method:s,params:t}};a.dispatch("callConfluenceSerivce",{apiPath:"/rest/api/content/"+c,method:"put",data:n,callback:r})},params:e},FAILcallback:{method:s,params:e}};a.dispatch("callConfluenceSerivce",{apiPath:"/rest/api/content?spaceKey=IED&title="+e.pageContentTitle+"&expand=version,body.storage",method:"get",callback:t})}};l.a.use(i.a),e.a=new i.a.Store({state:m,mutations:d,getters:h,actions:k})},function(a,e,t){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var s=t(1),o=t(12),c=t(19),n=t(43);t.n(n);t(16),s.a.config.productionTip=!1,s.a.use(o.C),t(41),o.C.start(function(){new s.a({el:"#q-app",router:c.a,render:function(a){return a(t(45))}})})},function(a,e){},,,function(a,e,t){"use strict";function s(a){return function(){return t(40)("./"+a+".vue")}}function o(a,e,t,s){l.a.commit("SET_PAGE_TITLE",s),t()}function c(a,e,t){var s=!1;void 0!==l.a&&void 0!==l.a.getters&&(s=l.a.getters.is_logged_in),s?t():t({path:"/login",query:{redirect:a.fullPath}})}var n=t(1),r=t(20),l=t(13);n.a.use(r.a),e.a=new r.a({routes:[{path:"/",component:s("Index"),beforeEnter:c,children:[{path:"/",redirect:"/home"},{path:"home",component:s("DetailedProgress"),beforeEnter:function(a,e,t){o(a,e,t,"Home")}},{path:"exceptions",component:s("Exceptions"),beforeEnter:function(a,e,t){o(a,e,t,"Exceptions")}},{path:"sprints",component:s("Sprints"),beforeEnter:function(a,e,t){o(a,e,t,"Sprints")}},{path:"sprints/:sprintID",component:s("DetailedProgress"),beforeEnter:function(a,e,t){o(a,e,t,"Sprint "+a.params.sprintID)}},{path:"progress",component:s("Progress"),beforeEnter:function(a,e,t){o(a,e,t,"Progress")}},{path:"test",component:s("Test"),beforeEnter:function(a,e,t){o(a,e,t,"Temp Test Page")}},{path:"/changeproject",component:s("ChangeProject"),beforeEnter:function(a,e,t){o(a,e,t,"Change Project")}}]},{path:"/login",component:s("Login"),beforeEnter:function(a,e,t){o(a,e,t,"Login")}},{path:"/loginTEST",component:s("LoginTEST"),beforeEnter:function(a,e,t){o(a,e,t,"Login")}},{path:"/logout",beforeEnter:function(a,e,t){l.a.commit("LOGOUT"),t("/login")}},{path:"*",component:s("Error404")}]})},,,,,,,,,,,,,,,,,,,,,function(a,e,t){function s(a){var e=o[a];return e?t.e(e[1]).then(function(){return t(e[0])}):Promise.reject(new Error("Cannot find module '"+a+"'."))}var o={"./ChangeProject.vue":[51,0],"./DetailedProgress.vue":[52,5],"./Error404.vue":[53,8],"./Exceptions.vue":[54,4],"./Index.vue":[55,6],"./Login.vue":[56,7],"./Progress.vue":[57,3],"./Sprints.vue":[58,2],"./Test.vue":[59,1]};s.keys=function(){return Object.keys(o)},s.id=40,a.exports=s},,function(a,e){},,function(a,e){},function(a,e,t){function s(a){t(46)}var o=t(11)(t(47),t(48),s,null,null);a.exports=o.exports},function(a,e){},function(a,e,t){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default={}},function(a,e){a.exports={render:function(){var a=this,e=a.$createElement,t=a._self._c||e;return t("div",{attrs:{id:"q-app"}},[t("router-view")],1)},staticRenderFns:[]}}],[15]);