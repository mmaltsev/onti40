let enriched_ttl = ''

ttlDataURI= sessionStorage.getItem('ttl_file') || ''
ttlFileName = sessionStorage.getItem('ttl_file_name') || ''
params = sessionStorage.getItem('params_file') || ''
if (ttlDataURI && params) {
  let formData = new FormData()
  let ttlBlob = dataURItoBlob(ttlDataURI)
  let paramsBlob = new Blob([params], {type: 'application/json'})
  formData.append('ttl', ttlBlob)
  formData.append('params', paramsBlob)
  //setSpinner(true)
  //postRequest('/result/enrich', formData, (data) => {
  //  setSpinner(false)
  //  enriched_ttl = data['enriched_ttl']
  //  document.getElementById('download').style.display = 'initial'
  //})
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
  download(enriched_ttl, enrichedFilename, 'text/turtle')
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
  } else {
    document.getElementById('spinner').style.display = 'none'
  }
}
