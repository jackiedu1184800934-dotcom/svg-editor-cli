import { GeometryShape } from './GeometryShape.js';
import { Value } from './Value.js';

export class Text extends GeometryShape {
  #content: string;
  constructor(id: string, x = 0, y = 0, content = '') {
    super(id, new Map([['x', x], ['y', y]]), [['x', 'y']], []);
    this.#content = Value.text(content);
  }
  get type(): string { return 'text'; }
  override get textContent(): string { return this.#content; }
  override set(attribute: string, value: string): void {
    if (attribute === 'text') this.#content = Value.text(value);
    else super.set(attribute, value);
  }
  clone(): Text { return this.copyStyle(new Text(this.id, this.geometry('x'), this.geometry('y'), this.#content)); }
  override geometrySummary(): string { return `${this.positionSummary()} ${JSON.stringify(this.#content)}`; }
}
