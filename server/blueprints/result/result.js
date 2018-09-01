let enriched_ttl = ''

ttlDataURI = sessionStorage.getItem('ttl_file') || ''
ttlFileName = sessionStorage.getItem('ttl_file_name') || ''
params = sessionStorage.getItem('params_file') || ''
if (ttlDataURI && params) {
  let formData = new FormData()
  let ttlBlob = dataURItoBlob(ttlDataURI)
  let paramsBlob = new Blob([params], {type: 'application/json'})
  formData.append('ttl', ttlBlob)
  formData.append('params', paramsBlob)
  setSpinner(true)
  postRequest('/result/enrich', formData, (data) => {
    console.log(data)
    ontology_stats = data['ontology_stats']
    enrichedOntology = data['enriched_ontology']
    ontology_summary = data['ontology_summary']
    enrichment_time = data['enrichment_time']
    enrichment_stats = data['enrichment_stats']
    document.getElementById('enr-stats').innerHTML = 
      '<p>enriched <span class="enr-num">' + enrichment_stats['subj_num'] + '</span>' +
      ' subject(s) <p>with <span class="enr-num">' + enrichment_stats['trip_num'] + '</span> triple(s)'
    document.getElementById('enr-logs').innerHTML = 
      'enriched within <span class="enr-num">' + enrichment_time + 's</span>' +
      '<p><span class="enr-num">0</span> error(s)<p><span class="enr-num">0</span> warning(s)'
    document.getElementById('ont-stats').innerHTML = 
      '<span class="enr-num">' + ontology_stats['trip_num'] + '</span> triple(s)' +
      '<p><span class="enr-num">' + ontology_stats['subj_num'] + '</span> subject(s)' +
      '<p><span class="enr-num">' + ontology_stats['pred_num'] + '</span> predicate(s)' +
      '<p><span class="enr-num">' + ontology_stats['obj_num'] + '</span> object(s)'
    sessionStorage.setItem('ontology_summary', JSON.stringify(ontology_summary))
    sessionStorage.setItem('enriched_ontology', enrichedOntology)
    //sessionStorage.setItem('subs_data', JSON.stringify(data['subs_data']))
    //sessionStorage.setItem('updated', JSON.stringify(enr_stats['updated']))
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
  if (enriched_ttl !== '') {
    download(enriched_ttl, enrichedFilename, 'text/turtle')
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
      sessionStorage.setItem('shacl_template', file_data)
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
