import { Shape } from './Shape.js';
import { Value } from './Value.js';

export abstract class GeometryShape extends Shape {
  #geometry: Map<string, number>;
  readonly #positions: readonly (readonly [string, string])[];
  readonly #dimensions: ReadonlySet<string>;

  protected constructor(id: string, values: ReadonlyMap<string, number>,
    positions: readonly (readonly [string, string])[], dimensions: readonly string[]) {
    super(id);
    this.#positions = positions;
    this.#dimensions = new Set(dimensions);
    this.#geometry = new Map();
    for (const [key, value] of values) this.#geometry.set(key, this.#dimensions.has(key)
      ? Value.nonnegative(value, key) : Value.number(value, key));
  }

  protected geometry(key: string): number { return this.#geometry.get(key)!; }
  override get attributes(): ReadonlyMap<string, string> {
    return new Map([...super.attributes, ...Array.from(this.#geometry, ([k, v]) => [k, String(v)] as const)]);
  }

  override set(attribute: string, value: string): void {
    if (this.#geometry.has(attribute)) {
      this.#geometry.set(attribute, this.#dimensions.has(attribute)
        ? Value.nonnegative(value, attribute) : Value.number(value, attribute));
    } else super.set(attribute, value);
  }

  move(dx: number, dy: number): void {
    Value.number(dx, 'dx'); Value.number(dy, 'dy');
    const next = new Map(this.#geometry);
    for (const [x, y] of this.#positions) {
      next.set(x, Value.number(this.geometry(x) + dx, x));
      next.set(y, Value.number(this.geometry(y) + dy, y));
    }
    this.#geometry = next;
  }

  scale(factor: number): void {
    Value.positive(factor, 'scale factor');
    const next = new Map<string, number>();
    for (const [key, value] of this.#geometry) next.set(key, Value.number(value * factor, key));
    this.#geometry = next;
  }

  geometrySummary(): string {
    return Array.from(this.#geometry, ([key, value]) => `${key}=${value}`).join(' ');
  }

  positionSummary(): string {
    return this.#positions.map(([x, y]) => `(${this.geometry(x)},${this.geometry(y)})`).join(' -> ');
  }
}
