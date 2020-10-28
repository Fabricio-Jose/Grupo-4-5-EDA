const LEVELS = 8;
const nil = -1;

export interface RGBPixel {
  r: number;
  g: number;
  b: number;
}

export interface RGBAPixel {
  r: number;
  g: number;
  b: number;
  a: number;
}

export class QuantizerOctree {
  //   levels: number[];
  private root: QNode;
  private outputImg: Uint8ClampedArray;
  private inputImg: Uint8ClampedArray;
  private imgHeight = -1;
  private imgWidth = -1;
  private max_level: number;
  constructor() {
    // this.levels = new Array<number>(LEVELS);
    this.root = new QNode(-1);
    this.outputImg = new Uint8ClampedArray();
    this.inputImg = new Uint8ClampedArray();
    this.max_level = 7;
  }
  private insertPixel(color: RGBPixel): void {
    this.root.insertRGBPixel(color, 0);
  }

  private buildOutputImg(): void {
    this.outputImg = new Uint8ClampedArray(4 * this.imgWidth * this.imgHeight);
    for (let i = 0; i < this.inputImg.length; i += 4) {
      let rgbaPixel: RGBAPixel = {
        r: this.inputImg[i + 0],
        g: this.inputImg[i + 1],
        b: this.inputImg[i + 2],
        a: this.inputImg[i + 3],
      };
      let rgbPixel: RGBPixel = {
        r: this.inputImg[i + 0],
        g: this.inputImg[i + 1],
        b: this.inputImg[i + 2],
      };
      let qnode = this.getQNode(rgbPixel, this.root, 0);
      let outputPixel: RGBPixel = {
        r: qnode.pixelAccumulator.baseRGB.r / qnode.pixelCount,
        g: qnode.pixelAccumulator.baseRGB.g / qnode.pixelCount,
        b: qnode.pixelAccumulator.baseRGB.b / qnode.pixelCount,
      };
      this.outputImg[i + 0] = outputPixel.r;
      this.outputImg[i + 1] = outputPixel.g;
      this.outputImg[i + 2] = outputPixel.b;
      this.outputImg[i + 3] = rgbaPixel.a;
    }
  }

  private BFS_reduce(root: QNode): void {
    this.max_level--;
    let queue = [root];
    let visited = new Set<QNode>();
    while (queue.length > 0) {
      let qnode = queue.shift()!;
      for (let qchild of qnode.children) {
        if (qchild) {
          if (qnode.level === this.max_level) {
            qnode.leaf = true;
            qnode.pixelCount += qchild.pixelCount;
            qnode.pixelAccumulator.sumRGBValues(
              qchild.pixelAccumulator.baseRGB
            );
          }
          if (!visited.has(qchild) && qchild.level <= this.max_level) {
            visited.add(qchild);
            queue.push(qchild);
          }
        }
      }
    }
  }

  private reduceLevel(levelsToReduce: number): void {
    if (levelsToReduce > LEVELS) levelsToReduce = LEVELS;
    for (let i = 0; i < levelsToReduce; i++) {
      this.BFS_reduce(this.root);
    }
  }

  private getQNode(rgbPixel: RGBPixel, root: QNode, level: number): QNode {
    while (!root.leaf) {
      const index = getPixelIndex(rgbPixel, level);
      root = root.children[index];
      level++;
    }
    return root;
  }

  fill(data: Uint8ClampedArray, width: number, height: number): void {
    console.log({
      newWidth: width,
      newHeight: height,
    });
    console.log({ length: data.length });
    this.imgWidth = width;
    this.imgHeight = height;
    this.inputImg = data;
    for (let i = 0; i < data.length; i += 4) {
      let rgbPixel: RGBPixel = {
        r: data[i + 0],
        g: data[i + 1],
        b: data[i + 2],
      };
      this.insertPixel(rgbPixel);
    }
  }

  reduceAndShow(canvasId: string, levelsToReduce: number): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    canvas.width = this.imgWidth;
    canvas.height = this.imgHeight;
    const ctx = canvas.getContext("2d")!;
    this.reduceLevel(levelsToReduce);
    this.buildOutputImg();
    let imageData = new ImageData(
      this.outputImg,
      this.imgWidth,
      this.imgHeight
    );
    // Draw image data to the canvas
    ctx.putImageData(imageData, 0, 0);
  }
}

class QNode {
  pixelAccumulator: RGBPixelAccumulator;
  pixelCount: number;
  children: QNode[];
  leaf: boolean;
  level: number;
  constructor(level: number) {
    this.level = level;
    this.leaf = true;
    this.pixelAccumulator = new RGBPixelAccumulator({ r: 0, g: 0, b: 0 });
    this.children = Array<QNode>(8);
    this.pixelCount = 0;
  }
  insertRGBPixel(rgbPixel: RGBPixel, level: number): void {
    if (level >= LEVELS) {
      this.pixelAccumulator.sumRGBValues(rgbPixel);
      this.pixelCount++;
    } else {
      this.leaf = false;
      let index = getPixelIndex(rgbPixel, level);
      // not null
      if (!this.children[index]) {
        this.children[index] = new QNode(level);
      }
      this.children[index].insertRGBPixel(rgbPixel, level + 1);
    }
  }
}

class RGBPixelAccumulator {
  baseRGB: RGBPixel;
  constructor(rgbPixel: RGBPixel) {
    this.baseRGB = rgbPixel;
  }
  sumRGBValues(rgbPixel: RGBPixel): void {
    this.baseRGB.r += rgbPixel.r;
    this.baseRGB.g += rgbPixel.g;
    this.baseRGB.b += rgbPixel.b;
  }
}

const getPixelIndex = (rgbPixel: RGBPixel, level: number): number => {
  let index = 0;
  let mask = 128 >> level;
  if (rgbPixel.r & mask) index |= 4;
  if (rgbPixel.g & mask) index |= 2;
  if (rgbPixel.b & mask) index |= 1;
  return index;
};
