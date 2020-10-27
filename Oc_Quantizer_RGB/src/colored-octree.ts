const LEVELS = 8;

export interface RGBPixel {
  r: number;
  g: number;
  b: number;
}

export class QuantizerOctree {
  //   levels: number[];
  private root: QNode;
  constructor() {
    // this.levels = new Array<number>(LEVELS);
    this.root = new QNode(0);
  }
  insertPixel(color: RGBPixel): void {
    this.root.insertRGBPixel(color, 0);
  }
  fill(data: Uint8ClampedArray): void {
    console.log({ dataleng: data.length });
    for (let i = 0; i < data.length; i += 4) {
      const rgbPixel: RGBPixel = {
        r: data[i],
        g: data[i + 1],
        b: data[i + 2],
      };
      // 7 levels of colors
      this.insertPixel(rgbPixel);
    }
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
  baseRGBPixel: RGBPixel;
  constructor(rgbPixel: RGBPixel) {
    this.baseRGBPixel = rgbPixel;
  }
  sumRGBValues(rgbPixel: RGBPixel): void {
    this.baseRGBPixel.r += rgbPixel.r;
    this.baseRGBPixel.g += rgbPixel.g;
    this.baseRGBPixel.b += rgbPixel.b;
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
