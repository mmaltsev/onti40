spinner(isActive = true)
let cy
postOntologyData()
// setCy()

function postOntologyData() {
  let formData = new FormData()
  let ttlData = sessionStorage.getItem('enriched_ttl')
  let subsData = sessionStorage.getItem('subs_data')
  let prefixes = JSON.stringify(extractPrefixes())
  console.log(prefixes)
  let ttlDataBlob = new Blob([ttlData], {type: 'text/turtle'})
  let subsDataBlob = new Blob([subsData], {type: 'application/json'})
  let prefixesBlob = new Blob([prefixes], {type: 'application/json'})
  formData.append('enriched_ttl', ttlDataBlob)
  formData.append('subs_data', subsDataBlob)
  formData.append('prefixes', prefixesBlob)
  postRequest('/graph/data', formData, (data) => {
    console.log(data)
    setCy(data['cl_data'])
  })
}

function extractPrefixes() {
  let ttlData = sessionStorage["enriched_ttl"]
  let prefixInds = getIndicesOf('@prefix', ttlData, false)
  let prefixes = {}
  for (let i = 0; i < prefixInds.length; i++) {
    let sliceBegin = prefixInds[i]
    let sliceEnd = null
    if (i == prefixInds.length - 1) {
      let restStr = ttlData.substring(sliceBegin, ttlData.length)
      sliceEnd = restStr.search('.')
    } else {
      sliceEnd = prefixInds[i+1]
    }
    let prefixStr = ttlData.substring(sliceBegin, sliceEnd)
    let spaceInd = prefixStr.search(' ')
    let colonInd = prefixStr.search(':')
    let prefix = prefixStr.substring(spaceInd + 1, colonInd)
    let openBrackInd = prefixStr.search('<')
    let closeBrackInd = prefixStr.search('>')
    let url = prefixStr.substring(openBrackInd + 1, closeBrackInd)
    prefixes[url] = prefix
  }
  return prefixes
}

function getIndicesOf(searchStr, str, caseSensitive) {
  let searchStrLen = searchStr.length
  if (searchStrLen == 0) {
    return []
  }
  let startIndex = 0, index, indices = []
  if (!caseSensitive) {
    str = str.toLowerCase()
    searchStr = searchStr.toLowerCase()
  }
  while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    indices.push(index)
    startIndex = index + searchStrLen
  }
  return indices
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

function spinner(isActive) {
  if (isActive) {
    document.getElementById('container').style.opacity = 0.2
    document.getElementById('spinner').style.display = 'initial'
  } else {
    document.getElementById('container').style.opacity = 1
    document.getElementById('spinner').style.display = 'none'
  }
}

function setCy(elements) {
  cy = window.cy = cytoscape({
    container: document.getElementById('cy'),
    layout: {
      name: 'cose',
      idealEdgeLength: 100,
      nodeOverlap: 20,
      refresh: 20,
      fit: true,
      padding: 30,
      randomize: false,
      componentSpacing: 100,
      nodeRepulsion: 400000,
      edgeElasticity: 100,
      nestingFactor: 5,
      gravity: 80,
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0
    },
    style: getStyle(),
    elements: elements
  })
  spinner(isActive = false)
}

function getElements(){
  return [{
      "data": {
        "id": "1",
        "idInt": 1,
        "name": "PCNA",
        "score": 0.1,
        "group": "default",
      },
      "group": "nodes"
    }, {
      "data": {
        "id": "2",
        "idInt": 2,
        "name": "FEN1",
        "score": 0.1,
        "group": "enriched",
      },
      "group": "nodes"
    }, {
    "data": {
      "source": "1",
      "target": "2",
      "weight": 0.1,
      "label": "blah",
      "group": "default",
    },
    "group": "edges"
  }]
}

function getStyle() {
  return [
    {
      "selector": "node",
      "style": {
        "height": 40,
        "width": 40,
        "background-color": "#ccc",
        "content": "data(name)",
        "font-size": "12px",
        "text-valign": "center",
        "text-halign": "center",
        "background-color": "#555",
        "text-outline-color": "#555",
        "text-outline-width": "2px",
        "color": "#fff",
        "overlay-padding": "6px",
        "z-index": "10"
      }
    }, {
      "selector": "node[group=\"default\"]",
      "style": {
        "background-color": "#555",
        "text-outline-color": "#555",
      }
    }, {
      "selector": "node[group=\"enriched\"]",
      "style": {
        "background-color": "lightblue",
        "text-outline-color": "lightblue",
      }
    }, {
      "selector": "edge",
      "style": {
        "label": "data(label)",
        "font-size": "12px",
        "width": 1,
        "line-color": "#ccc"
      }
    }, {
      "selector": "edge[group=\"default\"]",
      "style": {
        "line-color": "#ccc"
      }
    }, {
      "selector": "edge[group=\"enriched\"]",
      "style": {
        "line-color": "lightblue"
      }
    }]
}