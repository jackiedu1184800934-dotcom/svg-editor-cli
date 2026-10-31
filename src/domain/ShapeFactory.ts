import { Circle } from './Circle.js';
import { Ellipse } from './Ellipse.js';
import { Group } from './Group.js';
import { Line } from './Line.js';
import { Rect } from './Rect.js';
import { Shape } from './Shape.js';
import { ShapeDefinition } from './ShapeDefinition.js';
import { Text } from './Text.js';

/** Name-dispatch site 1/2. Phase 2: replace built-in definitions with providers. */
export class ShapeFactory {
  readonly #definitions = new Map<string, ShapeDefinition>([
    ['rect', new ShapeDefinition(Rect, ['x', 'y', 'width', 'height'], 'fill')],
    ['circle', new ShapeDefinition(Circle, ['cx', 'cy', 'r'], 'fill')],
    ['ellipse', new ShapeDefinition(Ellipse, ['cx', 'cy', 'rx', 'ry'], 'fill')],
    ['line', new ShapeDefinition(Line, ['x1', 'y1', 'x2', 'y2'], 'stroke')],
    ['text', new ShapeDefinition(Text, ['x', 'y', 'text'])],
    ['g', new ShapeDefinition(Group, [])],
  ]);
  private definition(type: string): ShapeDefinition {
    const definition = this.#definitions.get(type);
    if (!definition) throw new Error(`unknown shape type: ${type} (is the plugin loaded?)`);
    return definition;
  }
  create(type: string, id: string, args: readonly string[]): Shape { return this.definition(type).create(id, args); }
  read(type: string, id: string, attributes: ReadonlyMap<string, string>, content: string): Shape {
    return this.definition(type).read(id, attributes, content);
  }
}
