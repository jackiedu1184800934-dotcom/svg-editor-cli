import { GeometryShape } from './GeometryShape.js';

export class Ellipse extends GeometryShape {
  constructor(id: string, cx = 0, cy = 0, rx = 0, ry = 0) {
    super(id, new Map([['cx', cx], ['cy', cy], ['rx', rx], ['ry', ry]]), [['cx', 'cy']], ['rx', 'ry']);
  }
  get type(): string { return 'ellipse'; }
  clone(): Ellipse {
    return this.copyStyle(new Ellipse(this.id, this.geometry('cx'), this.geometry('cy'), this.geometry('rx'), this.geometry('ry')));
  }
}
