import { Drawing } from '../../domain/Drawing.js';
import { EditCommand } from '../EditCommand.js';
import { Arguments } from '../Arguments.js';

export class MoveCommand extends EditCommand {
  constructor(private readonly args: Arguments) { super(); }
  protected apply(drawing: Drawing): string {
    this.args.count(3, 3, 'move <id> <dx> <dy>');
    const shape = drawing.find(this.args.at(0));
    const dx = this.args.number(1, 'dx'); const dy = this.args.number(2, 'dy');
    shape.move(dx, dy);
    return `${shape.label} moved ${shape.positionSummary() ? `to ${shape.positionSummary()}` : `by (${dx},${dy})`}`;
  }
}

