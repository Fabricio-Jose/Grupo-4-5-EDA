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
  stroke(0, 255, 0);
  noFill();
  circle(100, height - 100, 100);
  strokeWeight(1);
  var queue = [];

  root = build_kdtree(data);
  console.log(root);
  myDiagram.model = model;
  console.log('Altura del Arbol es ' + getHeight(root));
  // console.log(generate_dot(root));
  // graph
  console.log('circle');
  const points = range_query_circle(root, [100, 100], 50, queue, (depth = 0));
  console.log(points);
  for (let i in points) {
    strokeWeight(7);
    let [dist, x, y] = points[i];
    point(x, height - y);
  }
  model.nodeDataArray = gg(root);
}
