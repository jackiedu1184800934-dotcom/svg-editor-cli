import { Drawing } from '../../domain/Drawing.js';
import { EditCommand } from '../EditCommand.js';
import { Arguments } from '../Arguments.js';

export class SetCommand extends EditCommand {
  constructor(private readonly args: Arguments) { super(); }
  protected apply(drawing: Drawing): string {
    this.args.count(3, 3, 'set <id> <attr> <value>');
    const shape = drawing.find(this.args.at(0)); const attr = this.args.at(1); const value = this.args.at(2);
    shape.set(attr, value); return `${shape.label} updated: ${attr}=${JSON.stringify(value)}`;
  }
}

