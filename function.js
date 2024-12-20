var appearances = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
    60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
    79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97,
    98, 99, 100, 101, 102, 103, 104, 105, 106,
  ];
  var zones = [
    0, 1, 6, 16, 50, 67, 72, 73, 77, 78, 79, 80, 81, 83, 84, 85, 86, 87, 88, 11,
    18, 31, 32, 34, 35, 36, 39, 40, 66, 96, 97, 10, 17, 24, 25, 26, 27, 28, 29, 2,
    3, 4, 5, 7, 12, 14, 15, 21, 30, 33, 37, 38, 41, 43, 44, 45, 46, 47, 48, 49,
    68, 69, 70, 71, 74, 75, 76, 89, 90, 91, 92, 94, 95, 98, 99, 100, 101, 104,
    106, 42, 63, 64, 82, 93, 105, 8, 9, 13, 19, 20, 65, 103, 22, 23, 51, 52, 53,
    54, 55, 56, 57, 58, 59, 60, 61, 62, 102,
  ];
  var influences = [
    4, 16, 41, 39, 2, 5, 12, 65, 3, 15, 66, 1, 10, 42, 102, 19, 6, 14, 103, 37,
    21, 11, 32, 34, 70, 7, 33, 38, 46, 49, 75, 9, 17, 22, 45, 56, 60, 68, 74, 81,
    20, 27, 30, 31, 44, 48, 67, 71, 77, 84, 93, 0, 13, 18, 24, 25, 29, 40, 43, 47,
    51, 52, 54, 55, 76, 80, 82, 85, 87, 88, 100, 35, 61, 72, 78, 79, 91, 92, 95,
    8, 26, 28, 36, 58, 73, 86, 90, 94, 97, 98, 104, 23, 50, 53, 57, 59, 62, 63,
    64, 69, 83, 89, 96, 99, 101, 105, 106,
  ];
  
  function createAdjacencyMatrix(
    nodes,
    edges,
    positions = appearances,
    symetric = true
  ) {
    var edgeHash = {};
    for (x in edges) {
      var id = edges[x].source + "-" + edges[x].target;
      edgeHash[id] = edges[x];
    }
  
    var matrix = [];
    //create all possible edges
    for (const [a, node_a] of nodes.entries()) {
      for (const [b, node_b] of nodes.entries()) {
        var grid = {
          id: node_a.id + "-" + node_b.id,
          x: parseInt(node_a.id),
          y: parseInt(node_b.id),
          weight: 0,
          name_s: node_a.character,
          name_t: node_b.character,
          zone_s: node_a.zone,
          zone_t: node_b.zone,
        };
        if (edgeHash[grid.id]) {
          grid.weight += parseInt(edgeHash[grid.id].weight);
        }
        if (symetric && edgeHash[node_b.id + "-" + node_a.id])
          grid.weight += parseInt(edgeHash[node_b.id + "-" + node_a.id].weight);
        matrix.push(grid);
      }
    }
    return matrix;
  }
  

  var nodes = [];
  var edges = [];
  var adjancencymatrix = [];
  var echellexy, rows, columns, matrixViz;

  // On récupère les données du fichier JSON
  fetch('/got_social_graph.json') 
  .then(response => response.json()) 
  .then(data => { 
  nodes = data.nodes; // On récupère les noeuds
  edges = data.links; // On récupère les liens
  adjancencymatrix = createAdjacencyMatrix(nodes, edges); // On crée la matrice d'adjacence
  creationVisualisation(); // On crée la visualisation
  });

  // Fonction qui crée la matrice d'adjacence
  function creationVisualisation() {

      const margin = { top: 60, right: 30, bottom: 20, left: 60},
          width = 960,
          height = 960;

      var svg = d3.select("#visu-tp4")
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height)
                  .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
              

      var maxWeight = d3.max(nodes, function(d){  
          return d.influence;
      }); 
      
      var scale = d3.scaleQuantize() 
                  .domain([0, maxWeight])
                  .range(d3.schemeBlues[9]);

      var zoneScale = d3.scaleOrdinal(d3.schemeCategory10);

      var positionsPersonnages = d3.range(nodes.length);	// un tableau d'autant d'element que de personnages
      echellexy = d3.scaleBand()
          .range([0, width]) // TODO correspond [0, largeur du dessin]
          .domain(positionsPersonnages) 
          .paddingInner(0.1) 
          .align(0)
          .round(true);


      var labels = d3.select("svg")
                  .append("g")
                  .attr("transform", "translate(60, 60)")
                  .style("font-size", "8px")
                  .style("font-family", "sans-serif");
              
      columns = labels
          .append("g")
          .selectAll()
          .data(nodes)
          .join("text")
          .attr("dx", 0)
          .attr("dy", function(d) { return echellexy(d.id)+5 ; })
          .text(function(d) { return d.character; })
          .attr("transform", "rotate(-90)"); // on tourne tout l'axe de 90°
      
      rows = labels
          .append("g")
          .selectAll()
          .data(nodes)
          .join("text")
          .attr("dx", 0)
          .attr("dy", function(d) { return echellexy(d.id)+5; })
          .attr("text-anchor", "end")
          .text(function(d) { return d.character; });
      
          
      //let taille = width / nodes.length - echellexy.bandwidth() / 2;
      matrixViz = svg.selectAll("rect")
      .data(adjancencymatrix)
      .join("rect")
      .attr("width", 5)
      .attr("height", 5)
      .attr("x", function (d) {
          return echellexy(parseInt(d.x));
      })
      .attr("y", function (d) {
          return echellexy(parseInt(d.y));
      })  
      .style("fill", function(d) {
          return d.zone_s === d.zone_t ? zoneScale(d.zone_s) : "#eee";
      })
      .style("fill-opacity", function(d) {
          return parseInt(d.weight)/10;
      })

  }

  // Fonction qui change l'affichage de la matrice
  function changeApparence() {
    var aff = document.getElementById("affichage").value;
    switch(aff) {
        case "apparence":
            update(appearances);
            break;
        case "zone":
            update(zones);
            break;
        case "influence":
            update(influences);
            break;
        default:
            break;
    }
  }

  // Fonction qui modifie l'affichage de la matrice
  function update(newPositions) {
      echellexy.domain(newPositions);

      rows
        .transition()
        .delay(200)
        .duration(3000)
        .attr("dy", function(d) { return echellexy(d.id)+5; });

      columns
        .transition()
        .delay(200)
        .duration(3000)
        .attr("dy", function(d) { return echellexy(d.id)+5; });

      matrixViz
        .transition()
        .delay(200)
        .duration(3000)
        .attr("x", function (d) {
            return echellexy(parseInt(d.x));
        })
        .attr("y", function (d) {
            return echellexy(parseInt(d.y));
        });
  }