const LEVELS = 8;

export interface Color {
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
  addColor(color: Color): void {
    this.root.addColor(color, 0);
  }
}

class QNode {
  colorpixel: ColorPixel;
  pixelCount: number;
  children: QNode[];
  leaf: boolean;
  level: number;
  constructor(level: number) {
    this.level = level;
    this.leaf = true;
    this.colorpixel = new ColorPixel({ r: 0, g: 0, b: 0 });
    this.children = Array<QNode>(8);
    this.pixelCount = 0;
  }
  addColor(color: Color, level: number): void {
    if (level >= LEVELS) {
      this.colorpixel.addColor(color);
      this.pixelCount++;
    } else {
      this.leaf = false;
      let index = getColorIndex(color, level);
      // not null
      if (!this.children[index]) {
        this.children[index] = new QNode(level);
      }
      this.children[index].addColor(color, level + 1);
    }
  }
}

class ColorPixel {
  color: Color;
  constructor(color: Color) {
    this.color = color;
  }
  addColorPixel(colorPixel: ColorPixel): void {
    this.color.r += colorPixel.color.r;
    this.color.g += colorPixel.color.g;
    this.color.b += colorPixel.color.b;
  }
  addColor(color: Color): void {
    this.color.r += color.r;
    this.color.g += color.g;
    this.color.b += color.b;
  }
}

const getColorIndex = (color: Color, level: number): number => {
  let index = 0;
  let mask = 128;
  if (color.r & mask) index |= 4;
  if (color.g & mask) index |= 2;
  if (color.b & mask) index |= 1;
  return index;
};
