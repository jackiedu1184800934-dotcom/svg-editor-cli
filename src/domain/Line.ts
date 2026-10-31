import { GeometryShape } from './GeometryShape.js';

export class Line extends GeometryShape {
  constructor(id: string, x1 = 0, y1 = 0, x2 = 0, y2 = 0) {
    super(id, new Map([['x1', x1], ['y1', y1], ['x2', x2], ['y2', y2]]), [['x1', 'y1'], ['x2', 'y2']], []);
  }
  get type(): string { return 'line'; }
  clone(): Line {
    return this.copyStyle(new Line(this.id, this.geometry('x1'), this.geometry('y1'), this.geometry('x2'), this.geometry('y2')));
  }
  override geometrySummary(): string { return this.positionSummary(); }
}
