import { Value } from '../domain/Value.js';

/** Normalizes the translate / positive uniform scale used in the assignment. */
export class ImportTransform {
  constructor(private readonly factor = 1, private readonly dx = 0, private readonly dy = 0) {}
  get scaleFactor(): number { return this.factor; }
  get offsetX(): number { return this.dx; }
  get offsetY(): number { return this.dy; }
  combine(local: ImportTransform): ImportTransform {
    return new ImportTransform(Value.number(this.factor * local.factor, 'transform scale'),
      Value.number(this.dx + this.factor * local.dx, 'transform x'),
      Value.number(this.dy + this.factor * local.dy, 'transform y'));
  }
  static parse(source: string): ImportTransform {
    let result = new ImportTransform(); let rest = source.trim();
    while (rest) {
      const translation = /^translate\s*\(([^()]*)\)/.exec(rest);
      const scaling = /^scale\s*\(([^()]*)\)/.exec(rest);
      const match = translation ?? scaling;
      if (!match) throw new Error('unsupported SVG transform: only translate and positive uniform scale are supported');
      const values = match[1]!.trim().split(/[\s,]+/).map(value => Value.number(value, 'transform'));
      if (values.length < 1 || values.length > 2) throw new Error('invalid SVG transform');
      let local: ImportTransform;
      if (translation) local = new ImportTransform(1, values[0]!, values[1] ?? 0);
      else {
        const factor = Value.positive(values[0]!, 'transform scale');
        if (values.length === 2 && values[1] !== factor) throw new Error('nonuniform SVG scale is not supported');
        local = new ImportTransform(factor);
      }
      result = result.combine(local); rest = rest.slice(match[0].length).trim().replace(/^,\s*/, '');
    }
    return result;
  }
}
