import type { Command } from '../Command.js';
import { Arguments } from '../Arguments.js';

export class HelpCommand implements Command {
  constructor(private readonly args: Arguments, private readonly usages: readonly string[]) {}
  execute(): readonly string[] {
    this.args.count(0, 0, 'help');
    return [...this.usages, '', 'Shapes:',
      '  create rect <id> <x> <y> <w> <h> [fill] [in <containerId>]',
      '  create circle <id> <cx> <cy> <r> [fill] [in <containerId>]',
      '  create ellipse <id> <cx> <cy> <rx> <ry> [fill] [in <containerId>]',
      '  create line <id> <x1> <y1> <x2> <y2> [stroke] [in <containerId>]',
      '  create text <id> <x> <y> "content" [in <containerId>]',
      '  create g <id> [in <containerId>]',
      'set: fill, stroke, stroke-width, shape geometry; text also accepts text.',
      'Comments start with #. Use double quotes for spaces; EOF (Ctrl+D) exits.'];
  }
}
