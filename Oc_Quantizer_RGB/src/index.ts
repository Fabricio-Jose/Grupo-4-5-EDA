import { QuantizerOctree } from "./colored-octree";
import { loadImg } from "./imgloader";

let imgInput = document.getElementById("imageInput") as HTMLInputElement;
let octree: QuantizerOctree;
imgInput.addEventListener("change", (e: Event) => {
  octree = new QuantizerOctree();
  console.log(octree);
  loadImg(e, octree);
});
