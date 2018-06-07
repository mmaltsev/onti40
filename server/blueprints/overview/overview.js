var standards = ['ISO_1101', 'ISO_16739', 'ISO_15746', 'ISO_22400']
depictArrayInHTML(standards, 'standard')
var standardOrganizations = ['ISO', 'IEC']
depictArrayInHTML(standardOrganizations, 'standardOrganization')
var predicates = ['sto:Standard', 'sto:StandardOrganization']
depictArrayInHTML(predicates, 'predicate')

function standardSearch(value) {
  let new_standards = searchValueInArr(standards, value)
  depictArrayInHTML(new_standards, 'standard')
}

function organizationSearch(value) {
  let new_standardOrganizations = searchValueInArr(standardOrganizations, value)
  depictArrayInHTML(new_standardOrganizations, 'standardOrganization')
}

function predicateSearch(value) {
  let new_predicates = searchValueInArr(predicates, value)
  depictArrayInHTML(new_predicates, 'predicate')
}

function searchValueInArr(arr, value) {
  let new_arr = []
  for (let element of arr)
    if (element.toLowerCase().search(value.toLowerCase()) > -1)
      new_arr.push(element)
  return new_arr
}

function depictArrayInHTML(arr, id_prefix) {
  let arrayHTML = ''
  for (let element of arr) {
    let listLine = '<a class="list-element" href="info.html?name=' +
      element + '&type=' + id_prefix + '">' + element + '</a>'
    arrayHTML += listLine
  }
  let id = id_prefix + 'sList'
  document.getElementById(id).innerHTML = arrayHTML
}
