// setSpinner(true)

let dropArea = document.getElementById('drop-area')
let isUploaded = false
let formData
eventHandler()
disablePropertiesBlock()

function eventHandler() {
  ;['dragenter', 'dragover', 'dragleave', 'drop']
    .forEach(eventName => dropArea.addEventListener(eventName, preventDefaults, false))
  ;['dragenter', 'dragover']
    .forEach(eventName => dropArea.addEventListener(eventName, highlight, false))
  ;['dragleave', 'drop']
    .forEach(eventName => dropArea.addEventListener(eventName, unhighlight, false))
  dropArea.addEventListener('drop', handleDrop, false)
}

function preventDefaults (e) {
  e.preventDefault()
  e.stopPropagation()
}

function highlight(e) {
  dropArea.classList.add('highlight')
}

function unhighlight(e) {
  dropArea.classList.remove('highlight')
}

function handleDrop(e) {
  document.getElementById('errorMessage').style.opacity = '0'
  isUploaded = false
  disablePropertiesBlock()
  let dt = e.dataTransfer
  let file = dt.files[0]
  uploadFile(file)
}

function uploadFile(file) {
  let fileName = file.name
  let fileFormat = fileName.split('.').pop()
  if (fileFormat === 'ttl') {
    fileReader = new FileReader()
    fileReader.onload = function (evt) {
      let file_data = evt.target.result
      sessionStorage.setItem('ttl_file', file_data)
      sessionStorage.setItem('ttl_file_name', fileName)
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

function enablePropertiesBlock() {
  document.getElementsByClassName('enrichment-properties')[0].style.opacity = '1'
  let checkboxList = document.getElementsByClassName('checkbox')
  for (let checkboxElement of checkboxList) {
    checkboxElement.getElementsByTagName('input')[0].disabled = false
  }
  document.getElementById('link-select').getElementsByTagName('input')[0].disabled = false
  document.getElementById('link-select').getElementsByTagName('select')[0].disabled = false
  document.getElementsByClassName('button')[0].style.pointerEvents = ''
}

function disablePropertiesBlock() {
  document.getElementsByClassName('enrichment-properties')[0].style.opacity = '0.1'
  let checkboxList = document.getElementsByClassName('checkbox')
  for (let checkboxElement of checkboxList) {
    checkboxElement.getElementsByTagName('input')[0].disabled = true
  }
  document.getElementById('link-select').getElementsByTagName('input')[0].disabled = true
  document.getElementById('link-select').getElementsByTagName('select')[0].disabled = true
  document.getElementsByClassName('button')[0].style.pointerEvents = 'none'
}

function launchEnrichment() {
  if (!isUploaded) {
    return
  }
  let params = {}
  let checkboxList = document.getElementsByClassName('checkbox')
  for (let checkboxElement of checkboxList) {
    let key = checkboxElement.getElementsByTagName('input')[0].value
    let value = '' + checkboxElement.getElementsByTagName('input')[0].checked
    params[key] = value
  }
  params['kg'] = document.getElementById('link-select').getElementsByTagName('select')[0].value
  params['pred'] = document.getElementById('link-select').getElementsByTagName('input')[0].value
  // DELETE
  params['pred'] = 'sto:hasDBpediaResource'
  if (params['kg'] === '') {
    document.getElementById('link-select').getElementsByTagName('select')[0].style.borderColor = 'red'
    return
  }
  if (params['pred'] === '') {
    document.getElementById('link-select').getElementsByTagName('input')[0].style.borderColor = 'red'
    return
  }
  sessionStorage.setItem('params_file', JSON.stringify(params))
  let redirectUrl = '/result?params=' + JSON.stringify(params)
  window.open(redirectUrl)
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

