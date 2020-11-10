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
  points.sort((a, b) => (a[axis] > b[axis] ? 1 : b[axis] > a[axis] ? -1 : 0));

  var median = Math.floor(points.length / 2);

  var node = new Node(points[median], axis);
  node.left = build_kdtree(points.slice(0, median), depth + 1);
  node.right = build_kdtree(points.slice(median + 1, points.length), depth + 1);

  return node;
}

const closestPoints = (data, query, k) => {
  let distances = new Array(query.length);
  let results = new Array(query.length);
  for (let i = 0; i < query.length; i++) {
    distances[i] = [];
    for (let j = 0; j < data.length; j++) {
      distances[i].push({ dist: $distance(query[i], data[j]), point: data[j] });
    }
    distances[i].sort((a, b) =>
      a.dist > b.dist ? 1 : b.dist > a.dist ? -1 : 0
    );
    results[i] = distances[i].slice(0, k);
  }
  return results;
};

const closest_point_brute_force = (points, point) => {
  let pair = [Infinity, null];
  for (let i = 0; i < points.length; i++) {
    let currDist = $distance(points[i], point);
    pair = pair[0] > currDist ? [currDist, points[i]] : pair;
  }
  return pair;
};

const naive_closest_point = (node, point, depth = 0, best = null) => {
  if (!node) return best;
  if (!best) best = [Infinity, null];
  let dist_node = $distance(node.point, point);
  if (best[0] > dist_node) best = [dist_node, node.point];
  let axis = depth % k;
  if (node.point[axis] > point[axis])
    return naive_closest_point(node.left, point, depth + 1, best);
  if (node.point[axis] <= point[axis])
    return naive_closest_point(node.right, point, depth + 1, best);
};

const $distance = (a, p) => {
  //euclidean distance
  if (a.length != p.length) return null;
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    dist += (a[i] - p[i]) ** 2;
  }
  return Math.sqrt(dist);
};

const data = [
  [1, 1],
  [2, 2],
  [3, 1],
  [4, 2],
  [5, 3],
  [2, 4],
  [3, 4],
  [4, 4],
];

const query = [[4, 5]];

console.log(closestPoints(data, query, 3)[0]);

// console.log(closest_point_brute_force(data, query[0]));

let testTree = build_kdtree(data);

console.log(naive_closest_point(testTree, query[0]));
