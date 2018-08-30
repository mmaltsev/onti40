//dataFetch()
let prefixes = extractPrefixes()
spinner(isActive = true)

let subsData = JSON.parse(sessionStorage.getItem('subs_data'))
let updated = JSON.parse(sessionStorage.getItem('updated'))
let options = []
for (sub in subsData) {
  if (subsData.hasOwnProperty(sub)) {
    // options.push(sub)
    let option = document.createElement('option')
    option.value = sub
    option.innerText = setPrefix(sub)
    document.getElementById('optionsSelect').appendChild(option)
  }
}
document.getElementById('optionsSelect').addEventListener('change', optionChange, false)
optionChange()

function spinner(isActive) {
  if (isActive) {
    document.getElementById('container').style.opacity = 0.2
    document.getElementById('spinner').style.display = 'initial'
  } else {
    document.getElementById('container').style.opacity = 1
    document.getElementById('spinner').style.display = 'none'
  }
}

function depictWheel(names, mtx, colors) {
  document.getElementById('chart').innerHTML = ''
  spinner(isActive = false)
  // Drawing chart
  let data = {
    packageNames: names,
    matrix: mtx,
    colors: colors
  }

  let chart = d3.chart.dependencyWheel()
    .width(800)  // also used for height, since the wheel is in a square
    .margin(200)  // used to display package names
    .padding(.02)  // separating groups in the wheel

  d3.select('#chart')
    .datum(data)
    .call(chart)
}

function saveAsPng() {
  let wheelElement = document.getElementById('wheel')
  saveSvgAsPng(wheelElement, 'wheel.png') // from saveSvgAsPng.js library
}

function optionChange() {
  let option = this.value
  if (option === undefined) {
    kyz = Object.keys(subsData)
    option = kyz[0]
  }
  let names = []
  for (let pred of subsData[option]) {
    names.push(setPrefix(pred))
  }
  let colors = makeArr(names.length, 'lightgray', false)
  if (updated.hasOwnProperty(option)) {
    let updatedInds = []
    for (let pred of updated[option]) {
      let predInd = subsData[option].indexOf(pred)
      if (predInd > -1) {
        updatedInds.push(predInd)
        colors[predInd] = 'lightgreen'
      }
    }
    for (let i = 0; i < updated[option].length - 1; i++) {
      if (updatedInds.indexOf(i) === -1) {
        names.push(setPrefix(updated[option][i]))
        colors.push('lightblue')
      }
    }
  }
  names.splice(0, 0, setPrefix(option))
  colors.splice(0, 0, 'gray')
  let mtx = makeArr(names.length, 0, true)
  for (i = 0; i < names.length; i++) {
    mtx[i][0] = 1
  }
  depictWheel(names, mtx, colors)
}

function makeArr(elementsNumber, value, is2D) {
  let arr = []
  for (i = 0; i < elementsNumber; i++) {
    if (is2D) {
      let row = []
      for (j = 0; j < elementsNumber; j++) {
        row.push(value)
      }
      arr.push(row)
    } else {
      arr.push(value)
    }
  }
  return arr
}

function extractPrefixes() {
  //let ttl_file = sessionStorage["ttl_file"]
  //let ttlData = atob(ttl_file.substring(13, ttl_file.length - 2))
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

function setPrefix(sub) {
  for (prefix in prefixes) {
    if (prefixes.hasOwnProperty(prefix) && sub.search(prefix) > -1) {
      sub = sub.replace(prefix, prefixes[prefix] + ':')
      return sub
    }
  }
  if (sub.search('http') > -1) {
    let prefixEndInd = sub.lastIndexOf('#')
    if (prefixEndInd === -1) {
      prefixEndInd = sub.lastIndexOf('/')
    }
    let url = sub.substring(0, prefixEndInd)
    let prefix = sub.substring(url.lastIndexOf('/') + 1, prefixEndInd)
    return prefix + ':' + sub.substring(prefixEndInd + 1, sub.length)
  } else {
    return '_:' + sub
  }
}
