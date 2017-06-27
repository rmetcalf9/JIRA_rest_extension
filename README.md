# Quasar App

> A Quasar project

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
var callBack = {
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
