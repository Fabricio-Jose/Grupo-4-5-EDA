import { QuantizerOctree } from './colored-octree';
import { loadImg } from './imgloader';

let octree = new QuantizerOctree();
console.log(octree);
let imgInput = document.getElementById('imageInput') as HTMLInputElement;
imgInput.addEventListener('change', (e: Event) => {
  loadImg(e, octree);
});
