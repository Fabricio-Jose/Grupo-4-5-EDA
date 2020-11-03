import { QuantizerOctree } from './colored-octree';

export const loadImg = (e: Event, octree: QuantizerOctree) => {
  let target = e.target as HTMLInputElement;
  let files = target.files as FileList;
  if (files) {
    let imagefile = files.item(0)!;
    let reader = new FileReader();
    reader.readAsDataURL(imagefile);

    reader.onloadend = (ev: Event) => {
      let img = new Image();
      img.src = reader.result as string;
      img.onload = (ev: Event) => {
        let canvas = document.getElementById('input-img') as HTMLCanvasElement;
        let context = canvas.getContext('2d') as CanvasRenderingContext2D;

        // original image size
        // canvas.width = img.width;
        // canvas.height = img.height;
        // context.drawImage(img, 0, 0);

        // resize
        resize(canvas, context, img);

        console.log({
          rawWidth: img.width,
          rawHeight: img.height,
        });

        // QOctree
        fillWithImg(canvas, octree);
        showResult(octree);
      };
    };
  }
};

export const resize = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  img: HTMLImageElement
) => {
  canvas.height = canvas.width * (img.height / img.width);
  let oc = document.createElement('canvas');
  let ocontext = oc.getContext('2d') as CanvasRenderingContext2D;
  oc.width = img.width * 0.5;
  oc.height = img.height * 0.5;
  ocontext.drawImage(img, 0, 0, oc.width, oc.height);
  ocontext.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);
  context.drawImage(
    oc,
    0,
    0,
    oc.width * 0.5,
    oc.height * 0.5,
    0,
    0,
    canvas.width,
    canvas.height
  );
};

const fillWithImg = (canvas: HTMLCanvasElement, octree: QuantizerOctree) => {
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  octree.fill(data, canvas.width, canvas.height);
};

const showResult = (octree: QuantizerOctree) => {
  const element = document.getElementById(
    'levels-to-reduce'
  ) as HTMLSelectElement;
  const options = element.options[element.selectedIndex];
  const value = parseInt(options.value);
  octree.reduceAndShow('output-img', value);
  octree.showInputPalette('input-palette');
  octree.showOutputPalette('output-palette');
};
