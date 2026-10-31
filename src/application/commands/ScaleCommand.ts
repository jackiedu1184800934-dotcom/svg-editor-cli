import { Drawing } from '../../domain/Drawing.js';
import { EditCommand } from '../EditCommand.js';
import { Arguments } from '../Arguments.js';

export class ScaleCommand extends EditCommand {
  constructor(private readonly args: Arguments) { super(); }
  protected apply(drawing: Drawing): string {
    this.args.count(2, 2, 'scale <id> <factor>');
    const shape = drawing.find(this.args.at(0)); const factor = this.args.number(1, 'scale factor');
    shape.scale(factor); return `${shape.label} scaled by ${factor}`;
  }
}

