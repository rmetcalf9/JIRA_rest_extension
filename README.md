# Quasar App

> A Quasar project

## JIRA API Details
https://developer.atlassian.com/jiradev/jira-apis


## Host
Not working due to SSL issues
https://rmetcalf9.github.io/JIRA_rest_extension/index.html


## Build Setup

``` bash
# install dependencies
$ npm install

# serve with hot reload at localhost:8080
$ quasar dev

# build for production with minification
$ quasar build

# lint code
$ quasar lint
```


# Callback structure
```
var callback = {
  OKcallback: {
    method: function (retData, passback) {
      commit('COMPLETED_LOADING')
    },
    params: {}
  },
  FAILcallback: {
    method: function (retData, passback) {
      commit('ERRORED_LOADING')
    },
    params: {}
  }
}
```
Usage
```
callBack.OKcallback.method(retData, callBack.OKcallback.params)
callBack.FAILcallback.method(retData, callBack.FAILcallback.params)
```

Pass through callBack
```
    var callbackPassthrough = {
      OKcallback: {
        method: function (retData, passback) {
          passback.OKcallback.method(retData, passback.OKcallback.params)
        },
        params: callback
      },
      FAILcallback: {
        method: function (retData, passback) {
          passback.FAILcallback.method(retData, passback.FAILcallback.params)
        },
        params: callback
      }
    }
```

