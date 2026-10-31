import { Value } from './Value.js';

export abstract class Shape {
  readonly #id: string;
  #style = new Map<string, string>();
  #presentation = new Map<string, string>();

  protected constructor(id: string) { this.#id = Value.id(id); }
  get id(): string { return this.#id; }
  get label(): string { return `${this.type}#${this.id}`; }
  get children(): readonly Shape[] { return []; }
  get textContent(): string | undefined { return undefined; }
  get attributes(): ReadonlyMap<string, string> { return new Map([['id', this.id], ...this.#style, ...this.#presentation]); }
  abstract get type(): string;
  abstract move(dx: number, dy: number): void;
  abstract scale(factor: number): void;
  abstract clone(): Shape;
  abstract geometrySummary(): string;
  abstract positionSummary(): string;

  set(attribute: string, value: string): void {
    if (!['fill', 'stroke', 'stroke-width'].includes(attribute)) {
      throw new Error(`unknown attribute: ${attribute}`);
    }
    this.#style.set(attribute, attribute === 'stroke-width'
      ? String(Value.nonnegative(value, attribute)) : Value.text(value));
  }

  /** Import-only presentation attributes do not widen the CLI set whitelist. */
  readAttribute(attribute: string, value: string): void {
    if (['font-size', 'font-family', 'font-weight', 'text-anchor', 'opacity',
      'fill-opacity', 'stroke-opacity', 'stroke-linecap', 'stroke-linejoin', 'data-kind'].includes(attribute)) {
      this.#presentation.set(attribute, Value.text(value));
    } else this.set(attribute, value);
  }

  protected copyStyle<T extends Shape>(copy: T): T {
    for (const [key, value] of this.#style) copy.set(key, value);
    for (const [key, value] of this.#presentation) copy.readAttribute(key, value);
    return copy;
  }

  summary(): string {
    return [this.label, this.geometrySummary(), ...Array.from(this.#style, ([k, v]) => `${k}=${v}`)]
      .filter(Boolean).join('  ');
  }

  details(): string[] {
    return [this.geometrySummary(), ...Array.from([...this.#style, ...this.#presentation], ([k, v]) => `${k}=${v}`)].filter(Boolean);
  }

  contains(shape: Shape): boolean { return this === shape || this.children.some(child => child.contains(shape)); }
}
