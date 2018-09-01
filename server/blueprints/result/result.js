let enrichedOntology = ''

ttlDataURI = localStorage.getItem('ttl_file') || ''
ttlFileName = localStorage.getItem('ttl_file_name') || ''
params = localStorage.getItem('params_file') || ''
outlineCards()
if (ttlDataURI && params) {
  let formData = new FormData()
  let ttlBlob = dataURItoBlob(ttlDataURI)
  let paramsBlob = new Blob([params], {type: 'application/json'})
  formData.append('ttl', ttlBlob)
  formData.append('params', paramsBlob)
  setSpinner(true)
  postRequest('/result/enrich', formData, (data) => {
    console.log(data)
    ontologyStats = data['ontology_stats']
    enrichedOntology = data['enriched_ontology']
    ontologySummary = data['ontology_summary']
    enrichmentTime = data['enrichment_time']
    enrichmentStats = data['enrichment_stats']
    enrichmentWarnsNum = data['enrichment_warns_num']
    document.getElementById('enr-stats').innerHTML = 
      '<p>enriched <span class="enr-num">' + enrichmentStats['subj_num'] + '</span>' +
      ' subject(s) <p>with <span class="enr-num">' + enrichmentStats['trip_num'] + '</span> triple(s)'
    document.getElementById('enr-logs').innerHTML = 
      'enriched within <span class="enr-num">' + enrichmentTime + 's</span>' +
      '<p><span class="enr-num">0</span> error(s)<p><span class="enr-num">' + 
      enrichmentWarnsNum + '</span> warning(s)'
    document.getElementById('ont-stats').innerHTML = 
      '<span class="enr-num">' + ontologyStats['trip_num'] + '</span> triple(s)' +
      '<p><span class="enr-num">' + ontologyStats['subj_num'] + '</span> subject(s)' +
      '<p><span class="enr-num">' + ontologyStats['pred_num'] + '</span> predicate(s)' +
      '<p><span class="enr-num">' + ontologyStats['obj_num'] + '</span> object(s)'
    localStorage.setItem('ontology_summary', JSON.stringify(ontologySummary))
    localStorage.setItem('enriched_ontology', enrichedOntology)
    //localStorage.setItem('subs_data', JSON.stringify(data['subs_data']))
    //localStorage.setItem('updated', JSON.stringify(enr_stats['updated']))
    setSpinner(false)
  },
  (err) => {
    console.error(err)
    alert('Enrichment has failed, try again.')
    window.location.replace('/upload')
  })
} else {
  window.location.replace('/')
}

function outlineCards() {
  console.log('outlineCards')
  let cardsConfig = JSON.parse(params)
  let cards = document.getElementsByClassName('card-grid')[0].children
  if (cardsConfig['ovstats'] === 'false') {
    cards[0].style.display = 'none'
  }
  if (cardsConfig['enstats'] === 'false') {
    cards[1].style.display = 'none'
  }
  if (cardsConfig['logs'] === 'false') {
    cards[2].style.display = 'none'
  }  
  if (cardsConfig['enont'] === 'false') {
    cards[3].style.display = 'none'
  }
  if (cardsConfig['graph'] === 'false') {
    cards[4].style.display = 'none'
  }
  if (cardsConfig['wheel'] === 'false') {
    cards[5].style.display = 'none'
  }
  if (cardsConfig['shacl'] === 'false') {
    cards[6].style.display = 'none'
    cards[7].style.display = 'none'
  }
}

function download(content, fileName, contentType) {
  var a = document.createElement('a')
  var file = new Blob([content], {type: contentType})
  a.href = URL.createObjectURL(file)
  a.download = fileName
  a.click()
}

function downloadClick() {
  let filenameArr = ttlFileName.split('.')
  filenameArr.splice(filenameArr.length - 1, 0, 'enriched')
  let enrichedFilename = filenameArr.join('.')
  if (enrichedOntology !== '') {
    download(enrichedOntology, enrichedFilename, 'text/turtle')
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

function uploadFile(file) {
  let fileName = file.name
  let fileFormat = fileName.split('.').pop()
  if (fileFormat === 'ttl') {
    fileReader = new FileReader()
    fileReader.onload = function (evt) {
      let file_data = evt.target.result
      localStorage.setItem('shacl_template', file_data)
    }
    fileReader.readAsDataURL(file)
    isUploaded = true
  } else {
    console.log('not ttl')
  }
}

function setSpinner(isSpinner) {
  if (isSpinner) {
    document.getElementById('spinner').style.display = 'block'
    document.getElementsByClassName('card-grid')[0].style.opacity = 0.3
  } else {
    document.getElementById('spinner').style.display = 'none'
    document.getElementsByClassName('card-grid')[0].style.opacity = 1
  }
}
