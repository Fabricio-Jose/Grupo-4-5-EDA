k = 2; // k-dimension

class Node {
	constructor(point, axis) {
		this.point = point;
		this.left = null;
		this.right = null;
		this.axis = axis;
	}
}

function getHeight(node) {
	if (node == null)
		return 0;
	var Hleft = getHeight(node.left) + 1;
	var Hright = getHeight(node.right) + 1;

	if (Hleft > Hright)
		return Hleft;
	return Hright;
}

function generate_dot(node) {
    if (!node) return;
    
	var left = node.left;
    var right = node.right;
    
	if (left) {
		console.log('"' + node.point + '"' + "->" + '"' + left.point + '"');
		generate_dot(left);
	}
	if (right) {
		console.log('"' + node.point + '"' + "->" + '"' + right.point + '"');
		generate_dot(right);	
	}
}

function build_kdtree(points, depth = 0) {
	if (points.length == 0) return;

	var axis = depth % k;
	points.sort((a, b) => (a[axis] > b[axis] ? 1 : b[axis] > a[axis] ? -1 : 0));

	var median = Math.floor(points.length/2);
    var node = new Node(points[median], axis);
    
	node.left = build_kdtree(points.slice(0, median), depth + 1);
	node.right = build_kdtree(points.slice(median + 1, points.length), depth + 1);

	return node;
}

function distanceSquared(point1, point2) {
	var distance = 0;
	for (var i=0; i<k; i++) {
		distance += Math.pow((point1[i] - point2[i]), 2);
	}
	return Math.sqrt(distance);
}

function closest_point_brute_force(points, point) {
	let shorter_distance = distanceSquared(points[0], point);
	let closest_point = points[0];
	for (let i=1; i<points.length; i++) {
		var dist_aux = distanceSquared(points[i], point);
		if (dist_aux < shorter_distance) {
			shorter_distance = dist_aux;
			closest_point = points[i];
		}
	}
	return closest_point;
}

function naive_closest_point(node, point, depth = 0, best = null) {
	if (!node) return ;
	if (!best) best = Infinity;

	let distance = distanceSquared(node.point, point);
	best = Math.min(distance, best);

	let axis = depth % k;
	if (point[axis] <= node.point[axis] && node.left) {
		return naive_closest_point(node.left, point, depth + 1, best);
	}
	if (node.right && point[axis] > node.point[axis]) {
		return naive_closest_point(node.right, point, depth + 1, best);
	}
	return node.point;
}

function closer_point(point, p1, p2){
	if (p2 == null) {
		return p1;
	}
	if (p1 == null) {
		return p2;
	}
	var distancia1 = distanceSquared(p1, point);
	var distancia2 = distanceSquared(p2, point);
	return (distancia1 < distancia2) ? p1 : p2;
}

function closest_point(node, point, depth = 0) {
	if (node == null) {
		return null;
	}
	var axis = depth % k;
	var next_branch = null;
	var oppsite_branch = null;
	if (point[axis] < node.point[axis]) {
		next_branch = node.left;
		oppsite_branch = node.right;
	}
	else {
		next_branch = node.right;
		oppsite_branch = node.left;
	}
	best = closer_point(point, closest_point(next_branch, point, depth + 1), node.point);
	if (distanceSquared(point, best) > Math.abs(point[axis] - node.point[axis])) {
		best = closer_point(point, closest_point(oppsite_branch, point, depth + 1), node.point);
	}
	return best;
}


function range_query_circle(node, center, radio, queue, depth = 0) {
	if (node == null) {
		return null;
	}
	var axis = node.axis ;
	var next_branch = null;
	var opposite_branch = null;
	if (center[axis]<node.point[axis]) {
		next_branch=node.left;
		opposite_branch=node.right;
	} else {
		next_branch=node.right;
		opposite_branch=node.left;
	}
	best = closer_point(center, node, range_query_circle(next_branch, center, radio, queue, depth + 1));
	if ((Math.abs(center[axis] - node.point[axis]) <= radio) && 
		distanceSquared(center, best.point) > Math.abs(center[axis] - node.point[axis])) {
		best = closer_point(center, best, range_query_circle(opposite_branch, center, radio, queue, depth + 1));
	}
	if (distanceSquared(center, node.point) <= radio)
		queue.push(node.point);
}

function contains(point_rect, range, point) {
	if (point[0] > point_rect[0] + range[0]/2 || 
		point[1] > point_rect[1] + range[1]/2 || 
		point[0] < point_rect[0] - range[0]/2 || 
		point[1] < point_rect[1] - range[1]/2)
		return false;
	else
		return true;
}

function range_query_rectangle(node, point, range, queue, depth = 0){
	if (node == null){
		return null;
	}
	var axis = node.axis ;
	var next_branch = null;
	var opposite_branch = null;
	if (point[axis] < node.point[axis]) {
		next_branch = node.left;
		opposite_branch = node.right;
	} else {
		next_branch = node.right;
		opposite_branch = node.left;
	}
	best = closer_point(point, node, range_query_circle(next_branch, point, range, queue, depth + 1));
	if((Math.abs((point[axis]) - node.point[axis]) <= range[axis]) || 
		distanceSquared(point, best.point) > Math.abs(point[axis] - node.point[axis])) {
		best = closer_point(point, best, range_query_circle(opposite_branch, point, range, queue, depth + 1));
	}
	if(contains(point, range, node.point))
		queue.push(node.point);
}





function knn(node, query_point, depth = 0){
    /*
    Let the test point be P = (y0, y1, ..., yk).
    Maintain a BPQ of the candidate nearest neighbors, called 'bpq'
    Set the maximum size of 'bpq' to k
    Starting at the root, execute the following procedure:
    
    if curr == NULL
        return
    
    Add the current point to the BPQ. Note that this is a no-op if the
    point is not as good as the points we've seen so far.
     
     enqueue curr into bpq with priority distance(curr, P)

    Recursively search the half of the tree that contains the test point. 
    
    if yi < curri
        recursively search the left subtree on the next axis
    else
        recursively search the right subtree on the next axis
    
    If the candidate hypersphere crosses this splitting plane, look on the
      other side of the plane by examining the other subtree.
     
     if:
        bpq isn't full
     -or-
     |curri – yi| is less than the priority of the max-priority elem of bpq
        then
        recursively search the other subtree on the next axis
    */

    nodes_visited += 1;

    if (node === null)      return;
    
    bpq.insert(node.point, distanceSquared(node.point, query_point)); //insertamos el nodo visitado a l a pila
    
    var axis = depth % k;
    var next_branch = null;
    var opposite_branch = null;

    if (query_point[axis] < node.point[axis]){
        next_branch = node.left;
        opposite_branch = node.right;
    }else{
        next_branch = node.right;
        opposite_branch = node.left;
    }
    
    knn(next_branch, query_point, depth +1);

    //si aun hay espacio en la pila y ademas el de prioridad mayor es > a y_1-y_0
	if ( bpq.queue.length < bpq.size || 
		Math.abs(query_point[axis] - node.point[axis]) < bpq.queue[bpq.queue.length - 1].priority){
        knn(opposite_branch, query_point, depth +1);
    }
}








/*function closest_point(node, point, depth = 0) {
    if(node == null) {
        return null;
    }

    if(point[node.axis] < node.point.vectorialSpace[node.axis]) {
        var nextBranch = node.left;
        var otherBranch = node.right;    
    } else {
        var nextBranch = node.right;
        var otherBranch = node.left;
    }

    var temp = closest_point(nextBranch, point, depth + 1);
    var best = closest(temp, node, point);
    
    var distanceBest = distanceSquared(point, best.point.vectorialSpace);
    var distanceAxis = Math.abs(point[node.axis] - node.point.vectorialSpace[node.axis]);

    if(distanceAxis <= distanceBest) {
        temp = closest_point(otherBranch, point, depth + 1);
        best = closest(temp, best, point);
    }
    
    return best;
}*/



/*function knn(node, point, n) {
	var cpoints = new Array(n);
	for (let i=0; i<n; i++) {
		cpoints.push(closest_point(node, point));
		delete_point(node, point);
		// ...
	}
}

const knn = (data, query, k) => {
	let distances = new Array(query.length);
	distances = [];
	for (let i = 0; i < data.length; i++) {
	  	distances.push({ dist: $distance(query, data[i]), point: data[i] });
	}
	distances.sort((a, b) => (a.dist > b.dist ? 1 : b.dist > a.dist ? -1 : 0));
	return distances.slice(0, k);
};*/
