import { Drawing } from '../../domain/Drawing.js';
import { EditCommand } from '../EditCommand.js';
import { Arguments } from '../Arguments.js';

export class AddToCommand extends EditCommand {
  constructor(private readonly args: Arguments) { super(); }
  protected apply(drawing: Drawing): string {
    this.args.count(2, 2, 'addto <gid> <id>');
    const gid = this.args.at(0); const id = this.args.at(1);
    drawing.addTo(gid, id); return `${drawing.find(id).label} moved into g#${gid}`;
  }
}

