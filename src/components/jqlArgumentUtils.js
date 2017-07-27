function joinStringArray (stringArr, joiner) {
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
}
function getIssueRetervialJQLArrayCriteria (criteriaARR, fieldName, arr) {
  if (arr.length > 0) {
    if (arr.length === 1) {
      criteriaARR.push(fieldName + '+%3D+' + arr[0])
    }
    else {
      criteriaARR.push(fieldName + '+IN+(' + joinStringArray(arr, ',') + ')')
    }
  }
}
export default function getIssueRetervialJQL (projects, issuetypes) {
  var criteria = []
  getIssueRetervialJQLArrayCriteria(criteria, 'project', projects)
  getIssueRetervialJQLArrayCriteria(criteria, 'issuetype', issuetypes)

  var criteriaStr = joinStringArray(criteria, '+AND+')
  return criteriaStr + '+ORDER+BY+KEY'
};
