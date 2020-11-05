k = 2;
class Node {
  constructor(point, axis) {
    this.point = point;
    this.left = null;
    this.right = null;
    this.axis = axis;
  }
}

function getHeight(node) {
  if (node == null) return 0;
  var Hleft = getHeight(node.left) + 1;
  var Hright = getHeight(node.right) + 1;

  if (Hleft > Hright) return Hleft;
  return Hright;
}

function generate_dot(node) {
  if (!node) return;
  var left = node.left;
  var right = node.right;
  if (left) {
    console.log('"' + node.point + '"' + '->' + '"' + left.point + '"');
    generate_dot(left);
  }
  if (right) {
    console.log('"' + node.point + '"' + '->' + '"' + right.point + '"');
    generate_dot(right);
  }
}

function build_kdtree(points, depth = 0) {
  if (points.length == 0) return;

  var axis = depth % k;
  points.sort(function (a, b) {
    return a[axis] > b[axis];
  });

  var median = Math.floor(points.length / 2);

  var node = new Node(points[median], axis);
  node.left = build_kdtree(points.slice(0, median), depth + 1);
  node.right = build_kdtree(points.slice(median + 1, points.length), depth + 1);

  return node;
}
