let root = null;
function setup() {
  var width = 500;
  var height = 500;
  createCanvas(width, height);

  background(0);
  for (var x = 0; x < width; x += width / 10) {
    for (var y = 0; y < height; y += height / 5) {
      stroke(125, 125, 125);
      strokeWeight(1);
      line(x, 0, x, height);
      line(0, y, width, y);
    }
  }
  var data = [];
  for (let i = 0; i < 100; i++) {
    var x = Math.floor(Math.random() * height);
    var y = Math.floor(Math.random() * height);
    data.push([x, y]);

    fill(255, 255, 255);
    circle(x, height - y, 7); //200-y para q se dibuje apropiadamente
    textSize(11);
    text(x + ',' + y, x + 5, height - y); //200-y para q se dibuje apropiadamente
  }
  root = build_kdtree(data);
  console.log(root);
  myDiagram.model = model;
  console.log('Altura del Arbol es ' + getHeight(root));
  // console.log(generate_dot(root));
  // graph
  // model.nodeDataArray = gg(testTree);
  model.nodeDataArray = gg(root);
  strokeWeight(8);
  stroke(255, 0, 0);
  let query = [100, 100];
  let nb = knn_no_labels(data, [100, 100], 4);
  point(query[0], height - query[1]);
  stroke(0, 255, 0);
  strokeWeight(1);
  for (let i = 0; i < nb.length; i++) {
    // console.log(nb[i]);
    let [x, y] = nb[i].point;
    circle(x, height - y, 11);
    textSize(11);
    text(x + ',' + y, x + 5, height - y); //200-y para q se dibuje apropiadamente
  }
}
