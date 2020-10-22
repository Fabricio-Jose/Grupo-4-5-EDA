import { Octree, Box } from './Octree';
import { loadImg } from './imgloader';

let octree = new Octree(new Box(0, 0, 0, 2, 2, 2), 5);
console.log(octree);

let imgInput = document.getElementById('imageInput') as HTMLInputElement;
imgInput.addEventListener('change', (e: Event) => {
  loadImg(e);
});
