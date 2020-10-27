import { QuantizerOctree } from "./colored-octree";

export const loadImg = (e: Event, octree: QuantizerOctree) => {
  // let img = document.getElementById('output') as HTMLImageElement;
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
        let canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
        let context = canvas.getContext("2d") as CanvasRenderingContext2D;

        // canvas.width = img.width;
        // canvas.height = img.height;
        // context.drawImage(img, 0, 0);

        canvas.height = canvas.width * (img.height / img.width);
        let oc = document.createElement("canvas");
        let ocontext = oc.getContext("2d") as CanvasRenderingContext2D;
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
        console.log({
          imgWidth: img.width,
          imgHeight: img.height,
        });
        console.log({
          width: canvas.width,
          height: canvas.height,
        });
        // QOctree
        imgLooper(canvas, octree);
      };
    };
  }
};

const imgLooper = (canvas: HTMLCanvasElement, octree: QuantizerOctree) => {
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  octree.fill(data);
};
