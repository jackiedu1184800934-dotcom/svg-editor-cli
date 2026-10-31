import { Shape } from './Shape.js';

/** Creation schema belongs to the factory, not a second shape-name dispatcher. */
export class ShapeDefinition {
  constructor(private readonly constructorType: new (id: string) => Shape,
    private readonly parameters: readonly string[], private readonly optionalStyle?: string) {}

  create(id: string, args: readonly string[]): Shape {
    if (args.length < this.parameters.length || args.length > this.parameters.length + (this.optionalStyle ? 1 : 0)) {
      throw new Error(`expected parameters: ${[...this.parameters, ...(this.optionalStyle ? [`[${this.optionalStyle}]`] : [])].join(' ') || '(none)'}`);
    }
    const shape = new this.constructorType(id);
    for (const [index, name] of this.parameters.entries()) shape.set(name, args[index]!);
    if (args.length > this.parameters.length) shape.set(this.optionalStyle!, args[this.parameters.length]!);
    return shape;
  }

  read(id: string, attributes: ReadonlyMap<string, string>, content: string): Shape {
    const shape = new this.constructorType(id);
    for (const [key, value] of attributes) {
      if (key !== 'id') shape.readAttribute(key, value);
    }
    if (shape.textContent !== undefined) shape.set('text', content);
    return shape;
  }
}
