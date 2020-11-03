import { resize } from './imgloader';

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
  private root: QNode;
  private outputImg: Uint8ClampedArray;
  private inputImg: Uint8ClampedArray;
  private inPalette: Uint8ClampedArray;
  private inPaletteWidth: number;
  private outPalette: Uint8ClampedArray;
  private outPaletteWidth: number;
  private imgHeight = -1;
  private imgWidth = -1;
  private max_level: number;
  private leaves: QNode[];
  constructor() {
    this.root = new QNode(-1);
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

  private getLeafNodesAfterReduction() {
    return this.leaves;
  }

  private BFSGetLeafNodes(): QNode[] {
    let queue = [this.root];
    this.leaves = [];
    while (queue.length > 0) {
      let qnode = queue.shift();
      if (qnode.leaf) {
        this.leaves.push(qnode);
      }
      for (let qchild of qnode.children) {
        //not null
        if (qchild && qchild.level <= this.max_level) {
          queue.push(qchild);
        }
      }
    }
    return this.leaves;
  }

  buildPalette(paletteName: string) {
    let leaves: QNode[];
    if (paletteName === 'outPalette') {
      leaves = this.getLeafNodesAfterReduction();
    } else {
      leaves = this.BFSGetLeafNodes();
    }
    let palette = new Uint8ClampedArray(
      4 *
        Math.floor(Math.sqrt(leaves.length)) *
        Math.floor(Math.sqrt(leaves.length))
    );
    for (let i = 0; i < palette.length; i += 4) {
      let rgbPalette: RGBAPixel = {
        r: leaves[i / 4].pixelAccumulator.baseRGB.r / leaves[i / 4].pixelCount,
        g: leaves[i / 4].pixelAccumulator.baseRGB.g / leaves[i / 4].pixelCount,
        b: leaves[i / 4].pixelAccumulator.baseRGB.b / leaves[i / 4].pixelCount,
        a: 255,
      };
      palette[i + 0] = rgbPalette.r;
      palette[i + 1] = rgbPalette.g;
      palette[i + 2] = rgbPalette.b;
      palette[i + 3] = rgbPalette.a;
    }
    if (paletteName === 'inPalette') {
      this.inPalette = palette;
      this.inPaletteWidth = Math.floor(Math.sqrt(leaves.length));
    }
    if (paletteName === 'outPalette') {
      this.outPalette = palette;
      this.outPaletteWidth = Math.floor(Math.sqrt(leaves.length));
    }
  }

  private BFS_reduce(root: QNode): void {
    this.max_level--;
    let queue = [root];
    let visited = new Set<QNode>();
    this.leaves = [];
    while (queue.length > 0) {
      let qnode = queue.shift();
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
      if (qnode.leaf) {
        this.leaves.push(qnode);
      }
    }
  }

  private reduceLevel(levelsToReduce: number): void {
    if (levelsToReduce > LEVELS) levelsToReduce = LEVELS;
    for (let i = 0; i < levelsToReduce; i++) {
      this.BFS_reduce(this.root);
    }
    //Build Palette when tree reduction is finished
    this.buildPalette('outPalette');
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
    //Build Palette when tree build is finished
    this.buildPalette('inPalette');
  }

  reduceAndShow(canvasId: string, levelsToReduce: number): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    canvas.width = this.imgWidth;
    canvas.height = this.imgHeight;
    const ctx = canvas.getContext('2d')!;
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

  showOutputPalette(canvasId: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    canvas.width = this.outPaletteWidth;
    canvas.height = this.outPaletteWidth;
    const ctx = canvas.getContext('2d');
    let imageData = new ImageData(this.outPalette, this.outPaletteWidth);
    ctx.putImageData(imageData, 0, 0);
  }

  showInputPalette(canvasId: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    canvas.width = this.inPaletteWidth;
    canvas.height = this.inPaletteWidth;
    const ctx = canvas.getContext('2d');
    // resize(canvas, ctx, )
    let imageData = new ImageData(this.inPalette, this.inPaletteWidth);
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
