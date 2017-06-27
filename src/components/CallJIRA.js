import axios from 'axios'

class CallJIRAc {
  constructor () {
    this.host = 'https://jira.cc.ic.ac.uk'
  }

  callGetService (URLPath, callBack) {
    var config = {
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:8080',
        'Content-Type': 'application/json'
      }
    }
    axios.get(
      this.host + URLPath,
      config
    )
    callBack.OKcallback.method(this.host + URLPath, callBack.OKcallback.params)
  }

  query (QueryString, callbackStructure) {
    this.callGetService('/rest/api/2/search?jql=project+%3D+SPI+AND+issuetype+%3D+Epic+ORDER+BY+KEY', callbackStructure)
  }
}

export default new CallJIRAc()
