import { Octree, Box, Point3D, Octant } from './Octree';

export function testBox() {
  let box = new Box(0, 0, 0, 2, 2, 2);
  let point: Point3D = { x: -1, y: 1, z: 1 };
  console.assert(
    box.findOctant(point) === Octant.UP_FRONT_LEFT,
    'should be UP_FRONT_LEFT'
  );
  point = { x: 1, y: 1, z: 1 };
  console.assert(
    box.findOctant(point) === Octant.UP_FRONT_RIGHT,
    'should be UP_FRONT_RIGHT'
  );
  point = { x: -1, y: 1, z: -1 };
  console.assert(
    box.findOctant(point) === Octant.UP_BACK_LEFT,
    'should be UP_BACK_LEFT'
  );
  point = { x: 1, y: 1, z: -1 };
  console.assert(
    box.findOctant(point) === Octant.UP_BACK_RIGHT,
    'should be UP_BACK_RIGHT'
  );
  point = { x: -1, y: -1, z: 1 };
  console.assert(
    box.findOctant(point) === Octant.DOWN_FRONT_LEFT,
    'should be DOWN_FRONT_LEFT'
  );
  point = { x: 1, y: -1, z: 1 };
  console.assert(
    box.findOctant(point) === Octant.DOWN_FRONT_RIGHT,
    'should be DOWN_FRONT_RIGHT'
  );
  point = { x: -1, y: -1, z: -1 };
  console.assert(
    box.findOctant(point) === Octant.DOWN_BACK_LEFT,
    'should be DOWN_BACK_LEFT'
  );
  point = { x: 1, y: -1, z: -1 };
  console.assert(
    box.findOctant(point) === Octant.DOWN_BACK_RIGHT,
    'should be DOWN_BACK_RIGHT'
  );
}

export function testIntersect() {
  console.assert(
    new Box(0, 0, 0, 1, 1, 1).intersect(new Box(0.5, 0.5, 0.5, 1, 1, 1)) ===
      true,
    'Should Intersect!'
  );
  console.assert(
    new Box(1, 1, 1, 1, 1, 1).intersect(new Box(1, 1, 1, 1, 1, 1)) === true,
    'Should Intersect!'
  );
  console.assert(
    new Box(0, 0, 0, 1, 1, 1).intersect(new Box(2, 2, 2, 2, 2, 2)) === false,
    'Should NOT Intersect!'
  );
}
