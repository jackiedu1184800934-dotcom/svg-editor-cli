import { Drawing } from '../../domain/Drawing.js';
import { EditCommand } from '../EditCommand.js';
import { Arguments } from '../Arguments.js';

export class GroupCommand extends EditCommand {
  constructor(private readonly args: Arguments) { super(); }
  protected apply(drawing: Drawing): string {
    this.args.count(2, 100000, 'group <newGid> <id1> <id2>...');
    const shape = drawing.group(this.args.at(0), this.args.values.slice(1));
    return `${shape.label} created with ${shape.children.length} children`;
  }
}

