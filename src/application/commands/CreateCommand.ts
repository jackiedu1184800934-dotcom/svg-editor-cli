import { Drawing } from '../../domain/Drawing.js';
import { EditCommand } from '../EditCommand.js';
import { Arguments } from '../Arguments.js';
import { ShapeFactory } from '../../domain/ShapeFactory.js';

export class CreateCommand extends EditCommand {
  constructor(private readonly args: Arguments) { super(); }
  protected apply(drawing: Drawing): string {
    this.args.count(2, 99, 'create <type> <id> [params...] [in <containerId>]');
    const values = [...this.args.values]; let parent: string | undefined;
    if (values.at(-2) === 'in') { parent = values.pop()!; values.pop(); }
    const [type, id, ...parameters] = values;
    if (!type || !id) throw new Error('usage: create <type> <id> [params...] [in <containerId>]');
    drawing.assertAvailable(id);
    if (parent !== undefined) drawing.container(parent);
    const shape = new ShapeFactory().create(type, id, parameters);
    drawing.add(shape, parent);
    return `${shape.label} created${parent ? ` in g#${parent}` : ''}`;
  }
}

