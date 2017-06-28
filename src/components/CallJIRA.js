import axios from 'axios'

export default class CallJIRAc {
  constructor () {
    this.host = 'http://localhost:1337/jira.cc.ic.ac.uk'
    this.authkey = ''
  }

  setAuthKey (authkey, callback) {
    var callbackPassthrough = {
      OKcallback: {
        method: function (retData, passback) {
          // TODO Determine if this log in is acceptable
          passback.OKcallback.method(retData, passback.OKcallback.params)
          this.authkey = authkey
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
    // this call will return 401 if user is not authencited
    this.callGetServiceINTERNAL('/rest/api/2/myself', callbackPassthrough, authkey)
  }
  isAuthKeySet () {
    return this.authkey === ''
  }
  clearAuthKey () {
    this.authkey = ''
  }

  // only used from inside this file.
  callGetServiceINTERNAL (URLPath, callBack, authkey) {
    var config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authkey
      }
    }
    console.log(config)
    axios.get(
      this.host + URLPath,
      config
    ).then(function (response) {
      if (response.status < 200) {
        callBack.FAILcallback.method({msg: 'Bad status', response: response}, callBack.FAILcallback.params)
      }
      else {
        if (response.status > 299) {
          callBack.FAILcallback.method({msg: 'Bad status', response: response}, callBack.FAILcallback.params)
        }
        else {
          callBack.OKcallback.method(response, callBack.OKcallback.params)
        }
      }
    })
    .catch(function (response) {
      callBack.FAILcallback.method({msg: 'TODO ERROR', response: response}, callBack.FAILcallback.params)
    })
  }

  callGetService (URLPath, callBack) {
    this.callGetServiceINTERNAL(URLPath, callBack, this.authkey)
  }

  query (QueryString, callbackStructure) {
    this.callGetService('/rest/api/2/search?jql=project+%3D+SPI+AND+issuetype+%3D+Epic+ORDER+BY+KEY', callbackStructure)
  }
}
