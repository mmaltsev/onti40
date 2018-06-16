dataFetch()

function spinner(isActive) {
  if (isActive) {
    document.getElementById('container').style.opacity = 0.2
    document.getElementById('spinner').style.display = 'initial'
  } else {
    document.getElementById('container').style.opacity = 1
    document.getElementById('spinner').style.display = 'none'
  }
}

function dataFetch() {
  spinner(isActive = true)
  let dataUrl = 'https://gist.githubusercontent.com/mmaltsev/237bf4c09414da02856225428d18010d/raw/76e12ed1baba9cf4870bc1be23cf52226f072312/sto_data.txt'
  let namesUrl = 'https://gist.githubusercontent.com/mmaltsev/33dad977c49e672d7cdbddd4b9682cdd/raw/70d97f3b7740d06dc678250cc20b201ec9d7fa01/sto_names.txt'
  //d3.json(dataUrl, function(mtx) {
  //  d3.json(namesUrl, function(names) {
  //    
  //  })
  //})
  getRequest('/wheel/data', (response) => {
    spinner(isActive = false)
      // Drawing chart
      var data = {
        packageNames: response.names,
        matrix: response.mtx,
        colors: response.colors
      }

      var chart = d3.chart.dependencyWheel()
        .width(800)  // also used for height, since the wheel is in a square
        .margin(200)  // used to display package names
        .padding(.02)  // separating groups in the wheel

      d3.select('#chart')
        .datum(data)
        .call(chart)
  })
}

function saveAsPng() {
  let wheelElement = document.getElementById('wheel')
  saveSvgAsPng(wheelElement, 'wheel.png') // from saveSvgAsPng.js library
}
