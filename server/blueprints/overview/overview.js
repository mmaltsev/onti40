// Initialization of global variables
standards = {}
standardOrganizations = {}
standardProperties = {}

// Initial request of the data
setSpinner('standardOrganization', true)
getRequest(
  '/overview/standard-organizations',
  (data) => {
    standardOrganizations = {
      stoNames: data['standard_organizations'],
      labels: data['standard_organization_names'],
    }
    depictInStatistics()
    depictArrayInHTML(standardOrganizations, 'standardOrganization')
  },
)
setSpinner('standard', true)
getRequest(
  '/overview/standards',
  (data) => {
    standards = {
      stoNames: data['standards'],
      labels: data['standard_labels'],
    }
    depictInStatistics()
    depictArrayInHTML(standards, 'standard')
  },
)
setSpinner('predicate', true)
getRequest(
  '/overview/sto-properties',
  (data) => {
    standardProperties = {
      stoNames: data['sto_properties'],
      labels: data['sto_properties'],
    }
    depictInStatistics()
    depictArrayInHTML(standardProperties, 'predicate')
  },
)
setSpinner('statistics', true)

// Search helper functions
function standardSearch(value) {
  let new_standards = searchValueInArr(standards, value)
  depictArrayInHTML(new_standards, 'standard')
}

function organizationSearch(value) {
  let new_standardOrganizations = searchValueInArr(standardOrganizations, value)
  depictArrayInHTML(new_standardOrganizations, 'standardOrganization')
}

function propertySearch(value) {
  let new_properties = searchValueInArr(standardProperties, value)
  depictArrayInHTML(new_properties, 'predicate')
}

function searchValueInArr(dict, value) {
  let new_dict = {
    stoNames: [],
    labels: []
  }
  for (let i = 0; i < dict.labels.length; i++) {
    label = dict.labels[i]
    stoName = dict.stoNames[i]
    if (label.toLowerCase().search(value.toLowerCase()) > -1) {
      new_dict.labels.push(label)
      new_dict.stoNames.push(stoName)
    }
  }
  return new_dict
}

// Array to HTML table transformation
function depictArrayInHTML(dict, id_prefix) {
  let arrayHTML = ''
  stoNames = dict.stoNames
  labels = dict.labels
  for (let i = 0; i < stoNames.length; i++) {
    let listLine = '<a class="list-element" href="/info?name=' + stoNames[i] +
      '&type=' + id_prefix + '" target="_blank">' + labels[i] + '</a>'
    arrayHTML += listLine
  }
  let id = id_prefix + 'sList'
  document.getElementById(id).innerHTML = arrayHTML
  setSpinner(id_prefix, false)
}

function depictInStatistics() {
  if (standards.stoNames && standardOrganizations.stoNames && standardProperties.stoNames) {
    let statisticsHTML = ''
    statisticsHTML += '<p><span class="stat-name"># of standards: </span><b>' + standards.stoNames.length + '</b></p>'
    statisticsHTML += '<p><span class="stat-name"># of standard organizations: </span><b>' + standardOrganizations.stoNames.length + '</b></p>'
    statisticsHTML += '<p><span class="stat-name"># of properties in the STO: </span><b>' + standardProperties.stoNames.length + '</b></p>'
    document.getElementById('statistics').innerHTML = statisticsHTML
    setSpinner('statistics', false)
  }
}

function setSpinner(type, isSet) {
  let spinnerElement = document.getElementById(type + '-spinner')
  spinnerElement.style.display = isSet ? 'initial' : 'none'
}
