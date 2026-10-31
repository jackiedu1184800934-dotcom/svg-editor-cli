import { Drawing } from '../../domain/Drawing.js';
import { EditCommand } from '../EditCommand.js';
import { Arguments } from '../Arguments.js';

export class UngroupCommand extends EditCommand {
  constructor(private readonly args: Arguments) { super(); }
  protected apply(drawing: Drawing): string {
    this.args.count(1, 1, 'ungroup <gid>'); const id = this.args.at(0);
    drawing.ungroup(id); return `g#${id} ungrouped`;
  }
}

