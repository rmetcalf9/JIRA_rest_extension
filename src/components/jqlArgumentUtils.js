export default {
  joinStringArray: function joinStringArray (stringArr, joiner) {
    if (typeof (joiner) === 'undefined') joiner = ''
    if (stringArr.length === 0) {
      return ''
    }
    if (stringArr.length === 1) {
      return stringArr[0]
    }
    var ret = ''
    for (var c in stringArr) {
      ret += stringArr[c] + joiner
    }
    // remove last joiner
    return ret.substr(0, ret.length - joiner.length)
  },
  getIssueRetervialJQLArrayCriteria: function getIssueRetervialJQLArrayCriteria (criteriaARR, fieldName, arr) {
    if (arr.length > 0) {
      if (arr.length === 1) {
        criteriaARR.push(fieldName + '+%3D+' + arr[0])
      }
      else {
        criteriaARR.push(fieldName + '+IN+(' + this.joinStringArray(arr, ',') + ')')
      }
    }
  },
  getIssueRetervialJQL: function getIssueRetervialJQL (projects, issuetypes) {
    var criteria = []
    this.getIssueRetervialJQLArrayCriteria(criteria, 'project', projects)
    this.getIssueRetervialJQLArrayCriteria(criteria, 'issuetype', issuetypes)

    var criteriaStr = this.joinStringArray(criteria, '+AND+')
    return criteriaStr + '+ORDER+BY+KEY'
  }
}
