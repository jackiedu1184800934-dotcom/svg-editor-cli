import { Shape } from './Shape.js';
import { Value } from './Value.js';

export class Group extends Shape {
  #children: Shape[] = [];
  constructor(id: string) { super(id); }
  get type(): string { return 'g'; }
  override get children(): readonly Shape[] { return [...this.#children]; }
  geometrySummary(): string { return ''; }
  positionSummary(): string { return ''; }
  move(dx: number, dy: number): void {
    Value.number(dx, 'dx'); Value.number(dy, 'dy');
    for (const child of this.#children) child.move(dx, dy);
  }
  scale(factor: number): void {
    Value.positive(factor, 'scale factor');
    for (const child of this.#children) child.scale(factor);
  }
  insert(shape: Shape, index = this.#children.length): void {
    if (shape.contains(this)) throw new Error(`cannot group a container into its own descendant: ${shape.id}`);
    if (this.#children.includes(shape)) throw new Error(`shape already in container: ${shape.id}`);
    if (!Number.isInteger(index) || index < 0 || index > this.#children.length) throw new Error('invalid child index');
    this.#children.splice(index, 0, shape);
  }
  remove(shape: Shape): number {
    const index = this.#children.indexOf(shape);
    if (index < 0) throw new Error(`no such child: ${shape.id}`);
    this.#children.splice(index, 1);
    return index;
  }
  clone(): Group {
    const copy = this.copyStyle(new Group(this.id));
    for (const child of this.#children) copy.insert(child.clone());
    return copy;
  }
}
