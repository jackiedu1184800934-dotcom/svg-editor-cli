import { Group } from './Group.js';
import { Shape } from './Shape.js';
import { Value } from './Value.js';

/** Owns structural invariants. The internal root is not an addressable SVG element. */
export class Drawing {
  #root = new Group('__internal_canvas__');
  #width: number;
  #height: number;
  constructor(width = 800, height = 600) {
    this.#width = Value.positive(width, 'canvas width');
    this.#height = Value.positive(height, 'canvas height');
  }
  get width(): number { return this.#width; }
  get height(): number { return this.#height; }
  get children(): readonly Shape[] { return this.#root.children; }
  resize(width: number, height: number): void {
    Value.positive(width, 'canvas width'); Value.positive(height, 'canvas height');
    this.#width = width; this.#height = height;
  }
  all(): Shape[] {
    const result: Shape[] = [];
    const pending = [...this.children];
    while (pending.length) {
      const shape = pending.shift()!;
      result.push(shape); pending.unshift(...shape.children);
    }
    return result;
  }
  find(id: string): Shape {
    const shape = this.all().find(item => item.id === id);
    if (!shape) throw new Error(`no such shape: ${id}`);
    return shape;
  }
  assertAvailable(id: string): void {
    Value.id(id);
    if (this.all().some(item => item.id === id)) throw new Error(`id already exists: ${id}`);
  }
  container(id: string): Group {
    const shape = this.all().find(item => item.id === id);
    if (!shape) throw new Error(`no such container: ${id}`);
    if (!(shape instanceof Group)) throw new Error(`not a container: ${id}`);
    return shape;
  }
  private parent(shape: Shape): Group {
    const parent = [this.#root, ...this.all()].find(item => item.children.includes(shape));
    if (!(parent instanceof Group)) throw new Error(`no parent for: ${shape.id}`);
    return parent;
  }
  parentLabel(id: string): string {
    const parent = this.parent(this.find(id));
    return parent === this.#root ? 'svg' : parent.label;
  }
  add(shape: Shape, containerId?: string): void {
    const pending = [shape];
    const ids = new Set(this.all().map(item => item.id));
    while (pending.length) {
      const next = pending.pop()!;
      if (ids.has(next.id)) throw new Error(`id already exists: ${next.id}`);
      ids.add(next.id); pending.push(...next.children);
    }
    (containerId ? this.container(containerId) : this.#root).insert(shape);
  }
  delete(id: string): Shape {
    const shape = this.find(id); this.parent(shape).remove(shape); return shape;
  }
  group(id: string, selectedIds: readonly string[]): Group {
    this.assertAvailable(id);
    if (!selectedIds.length) throw new Error('group requires at least one shape');
    if (new Set(selectedIds).size !== selectedIds.length) throw new Error('duplicate group target');
    const selected = selectedIds.map(target => this.find(target));
    for (const shape of selected) {
      if (selected.some(other => other !== shape && shape.contains(other))) {
        throw new Error(`cannot group a container into its own descendant: ${shape.id}`);
      }
    }
    // Global document order, independent of the argument order. Keep the group's
    // position at the earliest selected direct child of the lowest common parent.
    const ordered = this.all().filter(shape => selected.includes(shape));
    let destination = this.parent(ordered[0]!);
    while (!ordered.every(shape => destination.contains(shape))) destination = this.parent(destination);
    const index = destination.children.findIndex(child => ordered.some(shape => child.contains(shape)));
    for (const shape of ordered) this.parent(shape).remove(shape);
    const group = new Group(id);
    for (const shape of ordered) group.insert(shape);
    destination.insert(group, Math.min(index, destination.children.length));
    return group;
  }
  ungroup(id: string): void {
    const shape = this.find(id);
    if (!(shape instanceof Group)) throw new Error(`not a container: ${id}`);
    const parent = this.parent(shape);
    if (parent === this.#root) throw new Error(`cannot ungroup top-level container: ${id}`);
    const index = parent.remove(shape);
    for (const [offset, child] of shape.children.entries()) {
      shape.remove(child); parent.insert(child, index + offset);
    }
  }
  addTo(gid: string, id: string): void {
    const destination = this.container(gid);
    const shape = this.find(id);
    if (shape.contains(destination)) throw new Error(`cannot group a container into its own descendant: ${id}`);
    this.parent(shape).remove(shape); destination.insert(shape);
  }
  reorder(id: string, front: boolean): void {
    const shape = this.find(id); const parent = this.parent(shape);
    parent.remove(shape); parent.insert(shape, front ? parent.children.length : 0);
  }
  clone(): Drawing {
    const copy = new Drawing(this.width, this.height);
    for (const child of this.children) copy.#root.insert(child.clone());
    return copy;
  }
}
