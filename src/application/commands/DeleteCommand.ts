import { Drawing } from '../../domain/Drawing.js';
import { EditCommand } from '../EditCommand.js';
import { Arguments } from '../Arguments.js';

export class DeleteCommand extends EditCommand {
  constructor(private readonly args: Arguments) { super(); }
  protected apply(drawing: Drawing): string {
    this.args.count(1, 1, 'delete <id>');
    const shape = drawing.delete(this.args.at(0)); return `${shape.label} deleted`;
  }
}

