import { Drawing } from '../../domain/Drawing.js';
import { EditCommand } from '../EditCommand.js';
import { Arguments } from '../Arguments.js';

export class BackCommand extends EditCommand {
  constructor(private readonly args: Arguments) { super(); }
  protected apply(drawing: Drawing): string {
    this.args.count(1, 1, 'back <id>'); const id = this.args.at(0);
    drawing.reorder(id, false); return `${drawing.find(id).label} sent to back`;
  }
}

