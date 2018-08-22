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
    setSpinner(false)
    enriched_ttl = data['enr_ttl']
    sessionStorage.setItem('enriched_ttl', enriched_ttl)
    enr_stats = data['enr_stats']
    ont_stats = data['ont_stats']
    document.getElementById('enr-stats').innerHTML = 
      '<p>enriched <span class="enr-num">' + enr_stats['subj_num'] + '</span>' +
      ' subjects <p>with <span class="enr-num">' + enr_stats['trip_num'] + '</span> triples'
    document.getElementById('enr-logs').innerHTML = 
      'enriched within <span class="enr-num">' + enr_stats['subj_num'] + 's</span>' +
      '<p><span class="enr-num">0</span> errors<p><span class="enr-num">0</span> warnings'
    document.getElementById('ont-stats').innerHTML = 
      '<span class="enr-num">' + ont_stats['trip_num'] + '</span> triples' +
      '<p><span class="enr-num">' + ont_stats['subj_num'] + '</span> subjects' +
      '<p><span class="enr-num">' + ont_stats['pred_num'] + '</span> predicates' +
      '<p><span class="enr-num">' + ont_stats['obj_num'] + '</span> objects'
    sessionStorage.setItem('subs_data', JSON.stringify(data['subs_data']))
    sessionStorage.setItem('updated', JSON.stringify(data['enr_stats']['updated']))
  })
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
