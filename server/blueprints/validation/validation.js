setSpinner(true)
getRequest(
  'https://rawgit.com/i40-Tools/StandardOntology/master/sto.ttl',
  (data) => getRequest('/validation/template', (shapes) => getShacl(data, shapes))
)

var reportObj = {}

function onFilter() {
  setSpinner(true)
  let filterStr = document.getElementById('filter').value.toLowerCase()
  let filteredReportObj = {}
  for (let subject in reportObj) {
    if (reportObj.hasOwnProperty(subject)) {
      let lowerCaseSubhect = subject.toLowerCase()
      if (lowerCaseSubhect.indexOf(filterStr) > -1) {
        filteredReportObj[subject] = reportObj[subject]
      }
    }
  }
  depictTable(filteredReportObj)
  setSpinner(false)
}

function getShacl(data, shapes) {
  let validator = new SHACLValidator()
  validator.validate(data, 'text/turtle', shapes, 'text/turtle', (e, report) => {
    //console.log(report.results()[3].message())
    if (!report.conforms()) {
      generateReport(report)
      setSpinner(false)
    }
  })
}

function generateReport(report) {
  reportObj = {}
  for (let result of report.results()) {
    let subject = addPrefix(result.focusNode())
    let property = addPrefix(result.path())
    let error = shorten(result.message(), 'error')
    let constraint = shorten(result.sourceConstraintComponent(), 'constraint')
    if (!reportObj.hasOwnProperty(subject)) {
      reportObj[subject] = []
    }
    reportObj[subject].push({ property, error, constraint })
  }
  depictTable(reportObj)
}

function shorten(str, type) {
  if (type === 'error') {
    str = str.replace('>', '</i>')
    str = str.replace('<', '<i>')
    str = addPrefix(str)
    str = mapError(str)
  } else if (type === 'constraint') {
    str = str.substring(str.indexOf('#') + 1)
  }
  return str
}

function depictTable(reportObj) {
  let resultTableHTML = '<tr><th>Subject</th><th>Property</th><th>Error</th></tr>'
  for (let subject in reportObj) {
    if (reportObj.hasOwnProperty(subject)) {
      let cnt = 0
      for (let reportItem of reportObj[subject]) {
        //if (subject === 'sto:ASAM_ODS') console.log(reportItem.error)
        color = getRowColor(reportItem.constraint)
        if (cnt === 0) {
          resultTableHTML += '<tr><td class="subject endline" rowspan="' +
            reportObj[subject].length + '">' + subject + '</td>'
        } else {
          resultTableHTML += '<tr>'
        }
      
        // if last error message of the subject
        if (cnt === reportObj[subject].length - 1) {
          resultTableHTML += '<td class="endline" bgcolor="' + color + '">' + reportItem.property +
            '</td><td class="endline" bgcolor="' + color + '">' + reportItem.error + '</td></tr>'
        } else {
          resultTableHTML += '<td bgcolor="' + color + '">' + reportItem.property +
            '</td><td bgcolor="' + color + '">' + reportItem.error + '</td></tr>'
        }
        cnt++
      }
    }
  }
  document.getElementById('resultTable').innerHTML = resultTableHTML
}

function getRowColor(constraint) {
  for (let hierarchyLevel in constraintsHierarchy) {
    if (constraintsHierarchy.hasOwnProperty(hierarchyLevel)) {
      for (let constraintComponent of constraintsHierarchy[hierarchyLevel].constraints) {
        if (constraintComponent === constraint) {
          return constraintsHierarchy[hierarchyLevel].color
        }
      }
    }
  }
  console.warn('The color is not specified for the constraint `' + constraint + '`')
  return 'white'
}

function mapError(error) {
  let errorMapping = {
    'Less than 1 values': 'Value is not specified',
    'Value does not have node kind <i>shcl:IRI</i>': 'Value supposed to be <i>URI</i>',
    'Value does not have datatype': 'Value supposed to have datatype',
    'Value does not match pattern "^': 'Value should start with "',
  }
  for (let errorPattern in errorMapping) {
    if (errorMapping.hasOwnProperty(errorPattern)) {
      if (error.indexOf(errorPattern) > -1) {
        return error.replace(errorPattern, errorMapping[errorPattern])
      }
    }
  }
  return str
}

function addPrefix(uri) {
  for (let prefix of prefixes) {
    if (uri.indexOf(prefix['uri']) > -1) {
      return uri.replace(prefix['uri'], prefix['prfx'] + ':')
    }
  }
  return uri
}

function setSpinner(isSpinner) {
  if (isSpinner) {
    document.getElementById('spinner').style.display = 'block'
    document.getElementById('table-content').style.opacity = 0.4
  } else {
    document.getElementById('filter').style.display = 'block'
    document.getElementById('filter').focus()
    document.getElementById('search-img-wrap').style.display = 'block'
    document.getElementById('spinner').style.display = 'none'
    document.getElementById('table-content').style.opacity = 1
  }
}
