export enum Octant {
  UP_FRONT_LEFT = 0,
  UP_FRONT_RIGHT,
  UP_BACK_LEFT,
  UP_BACK_RIGHT,
  DOWN_FRONT_LEFT,
  DOWN_FRONT_RIGHT,
  DOWN_BACK_LEFT,
  DOWN_BACK_RIGHT,
  ERROR = -1,
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Dimension {
  width: number;
  height: number;
  depth: number;
}

export class Box {
  // x ~ width
  // y ~ height
  // z ~ depth
  center: Point3D;
  dimension: Dimension;
  minPos: Point3D;
  maxPos: Point3D;
  constructor(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number
  ) {
    this.center = { x: x, y: y, z: z };
    this.dimension = { width: width, height: height, depth: depth };
    this.minPos = { x: x - width / 2, y: y - height / 2, z: z - depth / 2 };
    this.maxPos = { x: x + width / 2, y: y + height / 2, z: z + depth / 2 };
  }
  contains(point3d: Point3D): boolean {
    if (
      this.center.x - point3d.x >= this.center.x - this.dimension.width / 2 &&
      this.center.x + point3d.x <= this.center.x + this.dimension.width / 2 &&
      this.center.y - point3d.y >= this.center.y - this.dimension.height / 2 &&
      this.center.y + point3d.y <= this.center.y + this.dimension.height / 2 &&
      this.center.z - point3d.z >= this.center.z - this.dimension.depth / 2 &&
      this.center.z + point3d.z <= this.center.z + this.dimension.depth / 2
    )
      return true;
    return false;
  }
  intersect(box: Box): boolean {
    return (
      this.minPos.x <= box.maxPos.x &&
      this.maxPos.x >= box.minPos.x &&
      this.minPos.y <= box.maxPos.y &&
      this.maxPos.y >= box.minPos.y &&
      this.minPos.z <= box.maxPos.z &&
      this.maxPos.z >= box.minPos.z
    );
  }
  findOctant(point3d: Point3D): Octant {
    // UP_FRONT_LEFT
    if (
      this.center.x - this.dimension.width / 2 <= point3d.x &&
      this.center.x >= point3d.x &&
      this.center.y + this.dimension.height / 2 >= point3d.y &&
      this.center.y <= point3d.y &&
      this.center.z + this.dimension.depth / 2 >= point3d.z &&
      this.center.z <= point3d.z
    ) {
      console.log('UP FRONT LEFT');
      return Octant.UP_FRONT_LEFT;
    }
    // UP_FRONT_RIGHT
    if (
      this.center.x + this.dimension.width / 2 >= point3d.x &&
      this.center.x <= point3d.x &&
      this.center.y + this.dimension.height / 2 >= point3d.y &&
      this.center.y <= point3d.y &&
      this.center.z + this.dimension.depth / 2 >= point3d.z &&
      this.center.z <= point3d.z
    ) {
      console.log('UP FRONT RIGHT');
      return Octant.UP_FRONT_RIGHT;
    }
    // UP_BACK_LEFT
    if (
      this.center.x - this.dimension.width / 2 <= point3d.x &&
      this.center.x >= point3d.x &&
      this.center.y + this.dimension.height / 2 >= point3d.y &&
      this.center.y <= point3d.y &&
      this.center.z - this.dimension.depth / 2 <= point3d.z &&
      this.center.z >= point3d.z
    ) {
      console.log('UP BACK LEFT');
      return Octant.UP_BACK_LEFT;
    }
    // UP_BACK_RIGHT
    if (
      this.center.x + this.dimension.width / 2 >= point3d.x &&
      this.center.x <= point3d.x &&
      this.center.y + this.dimension.height / 2 >= point3d.y &&
      this.center.y <= point3d.y &&
      this.center.z - this.dimension.depth / 2 <= point3d.z &&
      this.center.z >= point3d.z
    ) {
      console.log('UP BACK RIGHT');
      return Octant.UP_BACK_RIGHT;
    }
    // DOWN_FRONT_LEFT
    if (
      this.center.x - this.dimension.width / 2 <= point3d.x &&
      this.center.x >= point3d.x &&
      this.center.y - this.dimension.height / 2 <= point3d.y &&
      this.center.y >= point3d.y &&
      this.center.z + this.dimension.depth / 2 >= point3d.z &&
      this.center.z <= point3d.z
    ) {
      console.log('DOWN FRONT LEFT');
      return Octant.DOWN_FRONT_LEFT;
    }
    // DOWN_FRONT_RIGHT
    if (
      this.center.x + this.dimension.width / 2 >= point3d.x &&
      this.center.x <= point3d.x &&
      this.center.y - this.dimension.height / 2 <= point3d.y &&
      this.center.y >= point3d.y &&
      this.center.z + this.dimension.depth / 2 >= point3d.z &&
      this.center.z <= point3d.z
    ) {
      console.log('DOWN FRONT RIGHT');
      return Octant.DOWN_FRONT_RIGHT;
    }
    // DOWN_BACK_LEFT
    if (
      this.center.x - this.dimension.width / 2 <= point3d.x &&
      this.center.x >= point3d.x &&
      this.center.y - this.dimension.height / 2 <= point3d.y &&
      this.center.y >= point3d.y &&
      this.center.z - this.dimension.depth / 2 <= point3d.z &&
      this.center.z >= point3d.z
    ) {
      console.log('DOWN BACK LEFT');
      return Octant.DOWN_BACK_LEFT;
    }
    // DOWN_BACK_RIGHT
    if (
      this.center.x + this.dimension.width / 2 >= point3d.x &&
      this.center.x <= point3d.x &&
      this.center.y - this.dimension.height / 2 <= point3d.y &&
      this.center.y >= point3d.y &&
      this.center.z - this.dimension.depth / 2 <= point3d.z &&
      this.center.z >= point3d.z
    ) {
      console.log('DOWN BACK RIGHT');
      return Octant.DOWN_BACK_RIGHT;
    }
    console.log('NOT IN BOX');
    return Octant.ERROR;
  }
}

class OctreeNode {
  nodes: OctreeNode[];
  values: Point3D[];
  boundary: Box;
  divided: boolean;
  size: number;
  constructor(box: Box, capacity: number) {
    this.nodes = new Array(8);
    this.values = new Array(capacity);
    this.boundary = box;
    this.divided = false;
    this.size = 0;
  }
  subdivide(): void {
    this.divided = true;
    let _w = this.boundary.dimension.width / 2;
    let _h = this.boundary.dimension.height / 2;
    let _d = this.boundary.dimension.depth / 2;
    let x = this.boundary.center.x;
    let y = this.boundary.center.y;
    let z = this.boundary.center.z;
    let capacity = this.values.length;
    // UPPER PART
    this.nodes[Octant.UP_FRONT_LEFT] = new OctreeNode(
      new Box(x - _w / 2, y + _h / 2, z + _d / 2, _w, _h, _d),
      capacity
    );

    this.nodes[Octant.UP_FRONT_RIGHT] = new OctreeNode(
      new Box(x + _w / 2, y + _h / 2, z + _d / 2, _w, _h, _d),
      capacity
    );
    this.nodes[Octant.UP_BACK_LEFT] = new OctreeNode(
      new Box(x - _w / 2, y + _h / 2, z - _d / 2, _w, _h, _d),
      capacity
    );
    this.nodes[Octant.UP_BACK_RIGHT] = new OctreeNode(
      new Box(x + _w / 2, y + _h / 2, z - _d / 2, _w, _h, _d),
      capacity
    );
    // DOWN
    this.nodes[Octant.DOWN_FRONT_LEFT] = new OctreeNode(
      new Box(x - _w / 2, y - _h / 2, z + _d / 2, _w, _h, _d),
      capacity
    );
    this.nodes[Octant.DOWN_FRONT_RIGHT] = new OctreeNode(
      new Box(x + _w / 2, y - _h / 2, z + _d / 2, _w, _h, _d),
      capacity
    );
    this.nodes[Octant.DOWN_BACK_LEFT] = new OctreeNode(
      new Box(x - _w / 2, y - _h / 2, z - _d / 2, _w, _h, _d),
      capacity
    );
    this.nodes[Octant.DOWN_BACK_RIGHT] = new OctreeNode(
      new Box(x + _w / 2, y - _h / 2, z - _d / 2, _w, _h, _d),
      capacity
    );
  }
}

export class Octree {
  root: OctreeNode;
  capacity: number;
  constructor(box: Box, capacity: number) {
    this.root = new OctreeNode(box, capacity);
    this.capacity = capacity;
  }
  _add(point3d: Point3D, root: OctreeNode): void {
    if (root.boundary.contains(point3d) === false) {
      return;
    }
    if (root.size < this.capacity) {
      root.values[root.size++] = point3d;
    } else {
      root.subdivide();
      let OCTANT = root.boundary.findOctant(point3d);
      if (OCTANT !== Octant.ERROR) {
        root = root.nodes[OCTANT];
        this._add(point3d, root);
      } else {
        console.log('No OCTANT Found for', point3d);
      }
    }
  }
  add(point3d: Point3D): void {
    this._add(point3d, this.root);
  }
}

// let octree = new Octree(new Box(0, 0, 0, 2, 2, 2), 5);
