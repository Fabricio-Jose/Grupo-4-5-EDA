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
  else if (node.point[axis] < point[axis])
    return naive_closest_point(node.right, point, depth + 1, best);
  else if (JSON.stringify(node.point) === JSON.stringify(point)) return best;
};

// const closest_point = (node, point, depth = 0, best = null) => {
//   if (!node) return best;
//   if (!best) best = [Infinity, null];
//   let dist_node = $distance(node.point, point);
//   let left_dist = Infinity;
//   let right_dist = Infinity;
//   if (node.left) left_dist = $distance(node.left.point, point);
//   if (node.right) right_dist = $distance(node.right.point, point);
//   let smallerPoint = left_dist < right_dist ? node.left : node.right;

//   if (best[0] > dist_node) best = [dist_node, node.point];
//   let axis = depth % k;
//   if (node.point[axis] > point[axis])
//     return naive_closest_point(node.left, point, depth + 1, best);
//   else if (node.point[axis] <= point[axis])
//     return naive_closest_point(node.right, point, depth + 1, best);
// };

const $distance = (a, p) => {
  //euclidean distance
  if (a.length != p.length) return null;
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    dist += (a[i] - p[i]) ** 2;
  }
  return Math.sqrt(dist);
};

const knn_no_labels = (data, query, k) => {
  let distances = [];
  for (let i = 0; i < data.length; i++) {
    distances.push({ dist: $distance(query, data[i]), point: data[i] });
  }
  distances.sort((a, b) => (a.dist > b.dist ? 1 : b.dist > a.dist ? -1 : 0));
  return distances.slice(0, k);
};

const data = [
  [0, 0],
  [1, 1],
  [2, 2],
  [2.1, 1.5],
  [3, 2],
  [0, 1],
  [4, 1],
  [2.5, 1],
  [1.1, 3],
  [4, 0],
  [1, 4],
];

const query = [[1.9, 1.5]];

let testTree = build_kdtree(data);

console.log(naive_closest_point(testTree, query[0]));

console.log(knn_no_labels(data, query[0], 4));
