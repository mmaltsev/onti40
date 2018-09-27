setSpinner(true)
let ontologyDataURI = localStorage.getItem('ttl_file') || ''
if (ontologyDataURI !== '') {
  // cut the "data:;base64," and  "==" parts from the URI
  let ontologyBaseData = ontologyDataURI.substring(24, ontologyDataURI.length - 2)
  let ontologyData = atob(ontologyBaseData)
  let templateDataURI = localStorage.getItem('shacl_template') || ''
  if (templateDataURI !== '') {
    let templateBaseData = templateDataURI.substring(13, templateDataURI.length - 2)
    let templateData = atob(templateBaseData)
    getShacl(ontologyData, templateData)
  } else {
    getRequest(
      '/validation/template', 
      (shapes) => getShacl(ontologyData, shapes),
      (err) => {
        alert('SHACL template is not specified')
        window.location.replace('/result')
      }
    )
  }
}

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
    'Less than 1 values': 'Not specified',
    'More than 1 values': 'More than one value',
    'Value does not have node kind <i>shcl:IRI</i>': 'Supposed to be <i>URI</i>',
    'Value does not have datatype': 'Supposed to have datatype',
    'Value does not match pattern "^': 'Should start with "',
  }
  for (let errorPattern in errorMapping) {
    if (errorMapping.hasOwnProperty(errorPattern)) {
      if (error.indexOf(errorPattern) > -1) {
        return error.replace(errorPattern, errorMapping[errorPattern])
      }
    }
  }
  return error
}

function addPrefix(uri) {
  for (let prefix of prefixes) {
    if (uri.indexOf(prefix['uri']) > -1) {
      return uri.replace(prefix['uri'], prefix['prfx'] + ':')
    }
  }
  return uri
}

function uploadFile(file) {
  let fileName = file.name
  let fileFormat = fileName.split('.').pop()
  if (fileFormat === 'ttl') {
    fileReader = new FileReader()
    fileReader.onload = function (evt) {
      let file_data = evt.target.result
      localStorage.setItem('ttl_file', file_data)
      localStorage.setItem('ttl_file_name', fileName)
    }
    fileReader.readAsDataURL(file)

    enablePropertiesBlock()
    document.getElementById('upload-text').innerText = fileName
    document.getElementById('upload-img').src = 'assets/file.png'
    isUploaded = true
  } else {
    document.getElementById('errorMessage').style.opacity = '1'
  }
}

function dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], {type: mimeString});
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
