// dataFetch()
// let prefixes = extractPrefixes()
spinner(isActive = true)

// let subsData = JSON.parse(sessionStorage.getItem('subs_data'))
// let updated = JSON.parse(sessionStorage.getItem('updated'))
let ontologySummary = JSON.parse(sessionStorage.getItem('ontology_summary'))
for (let sub in ontologySummary) {
  if (ontologySummary.hasOwnProperty(sub)) {
    let option = document.createElement('option')
    option.value = sub
    option.innerText = ontologySummary[sub].label
    document.getElementById('optionsSelect').appendChild(option)
  }
}
document.getElementById('optionsSelect').addEventListener('change', optionChange, false)
optionChange()

function dataFetch() {
  let params = {
    ontology_summary: sessionStorage.getItem('ontology_summary')
  }
  postRequest('/wheel/data', params, (data) => {

  },
  (err) => {

  })
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
  console.log(option)
  if (option === undefined) {
    kyz = Object.keys(ontologySummary)
    option = kyz[0]
  }
  let names = [ontologySummary[option].label]
  let colors = ['gray']
  for (let pred in ontologySummary[option].predicates) {
    if (ontologySummary[option].predicates.hasOwnProperty(pred)) {
      names.push(ontologySummary[option].predicates[pred].label)
      let predColor = 'lightgray'
      let isAdded = ontologySummary[option].predicates[pred].added
      let isEnriched = ontologySummary[option].predicates[pred].enriched
      if (isAdded) {
        predColor = 'lightblue'
      } else if (isEnriched) {
        predColor = 'lightgreen'
      }
      colors.push(predColor)
    }
  }
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

