spinner(isActive = true)
sigma.classes.graph.addMethod('neighbors', function(nodeId) {
  var k,
      neighbors = {},
      index = this.allNeighborsIndex[nodeId] || {};
  for (k in index)
    neighbors[k] = this.nodesIndex[k];
  return neighbors;
});
setSigma()

function setSigma() {
  g = getSigmaData()
  s = new sigma({
    graph: g,
    renderer: {
      container: document.getElementById('graph-container'),
      type: 'canvas'
    },
    settings: {
      edgeLabelThreshold: 3
    }
  });
  // let layout algorithm pretify the graph for 5 secs
  s.startForceAtlas2({
    worker: true,
    barnesHutOptimize: false,
    strongGravityMode: true,
    gravity: 0.1,
    // linLogMode: true,
  })
  setTimeout(() => {
    s.killForceAtlas2()
  }, 5000)
  spinner(isActive = false)

  s.graph.nodes().forEach(function(n) {
    n.originalColor = n.color;
  });
  s.graph.edges().forEach(function(e) {
    e.originalColor = e.color;
  });

  s.bind('clickNode', function(e) {
    console.log('clickNode')
    var nodeId = e.data.node.id,
        toKeep = s.graph.neighbors(nodeId);
    toKeep[nodeId] = e.data.node;
    s.graph.nodes().forEach(function(n) {
      if (toKeep[n.id])
        n.color = n.originalColor;
      else
        n.color = '#f8f8f8';
    });
    s.graph.edges().forEach(function(e) {
      if (toKeep[e.source] && toKeep[e.target])
        e.color = e.originalColor;
      else
        e.color = '#f8f8f8';
    });
    s.refresh();
  });

  s.bind('clickStage', function(e) {
    console.log('clickStage')
    s.graph.nodes().forEach(function(n) {
      n.color = n.originalColor;
    });
    s.graph.edges().forEach(function(e) {
      e.color = e.originalColor;
    });
    s.refresh();
  });
}

function getSigmaData() {
  let ontology_summary = JSON.parse(sessionStorage.getItem('ontology_summary'))
  console.log(ontology_summary)
  let sigmaData = {
    nodes: [],
    edges: []
  }
  let ind = 0
  let subInfo = {}
  for (let subject in ontology_summary) {
    if (ontology_summary.hasOwnProperty(subject)) {
      let subjId = ind
      let subjColor = 'black'
      if (ontology_summary[subject]['enriched']) {
        subjColor = 'red'
      }
      let subjNode = {
        'id': 'n' + subjId,
        'label': ontology_summary[subject]['label'],
        'x': Math.random(),
        'y': Math.random(),
        'size': 1,
        'color': subjColor
      }
      sigmaData.nodes.push(subjNode)
      subInfo[subject] = {
        ind: ind,
        cnt: 1
      }
      ind ++
    }
  }
  for (let subject in ontology_summary) {
    if (ontology_summary.hasOwnProperty(subject)) {
      for (let predicate in ontology_summary[subject]['predicates']) {
        if (ontology_summary[subject]['predicates'].hasOwnProperty(predicate)) {
          let predicates = ontology_summary[subject]['predicates']
          for (let object in predicates[predicate]['objects']) {
            if (predicates[predicate]['objects'].hasOwnProperty(object)) {
              let objId = null
              if (ontology_summary.hasOwnProperty(object)) {
                objId = subInfo[object]['ind']
                sigmaData.nodes[objId]['size'] += 0.1
              } else {
                objId = ind
                ind ++
                let objColor = '#555'
                if (predicates[predicate]['objects'][object]['added']) {
                  objColor = 'lightblue'
                }
                let objNode = {
                  'id': 'n' + objId,
                  'label': predicates[predicate]['objects'][object]['label'],
                  'x': Math.random(),
                  'y': Math.random(),
                  'size': 0.1,
                  'color': objColor
                }
                sigmaData.nodes.push(objNode)
              }
              let predId = ind
              ind ++
              let predColor = '#eee'
              if (predicates[predicate]['enriched']) {
                predColor = 'lightgreen'
              } else if (predicates[predicate]['added']) {
                predColor = 'green'
              }
              let edge = {
                'id': 'e' + predId,
                'source': 'n' + subInfo[subject]['ind'],
                'target': 'n' + objId,
                'size': 0.005,
                'color': predColor,
                'label': ontology_summary[subject]['predicates'][predicate]['label']
              }
              sigmaData.edges.push(edge)
            }
          }
        }
      }
    }
  }
  console.log(sigmaData)
  return sigmaData
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
