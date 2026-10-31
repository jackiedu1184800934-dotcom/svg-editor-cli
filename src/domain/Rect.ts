import { GeometryShape } from './GeometryShape.js';

export class Rect extends GeometryShape {
  constructor(id: string, x = 0, y = 0, width = 0, height = 0) {
    super(id, new Map([['x', x], ['y', y], ['width', width], ['height', height]]), [['x', 'y']], ['width', 'height']);
  }
  get type(): string { return 'rect'; }
  clone(): Rect {
    return this.copyStyle(new Rect(this.id, this.geometry('x'), this.geometry('y'), this.geometry('width'), this.geometry('height')));
  }
  override geometrySummary(): string {
    return `x=${this.geometry('x')} y=${this.geometry('y')} w=${this.geometry('width')} h=${this.geometry('height')}`;
  }
}
