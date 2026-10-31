import { GeometryShape } from './GeometryShape.js';

export class Circle extends GeometryShape {
  constructor(id: string, cx = 0, cy = 0, r = 0) {
    super(id, new Map([['cx', cx], ['cy', cy], ['r', r]]), [['cx', 'cy']], ['r']);
  }
  get type(): string { return 'circle'; }
  clone(): Circle { return this.copyStyle(new Circle(this.id, this.geometry('cx'), this.geometry('cy'), this.geometry('r'))); }
}
