import type { Command } from '../Command.js';
import { Editor } from '../Editor.js';
import { Arguments } from '../Arguments.js';

export class ShowCommand implements Command {
  constructor(private readonly args: Arguments) {}
  execute(editor: Editor): readonly string[] {
    this.args.count(1, 1, 'show <id>'); const drawing = editor.current(); const shape = drawing.find(this.args.at(0));
    return [`${shape.label}  parent=${drawing.parentLabel(shape.id)}`, ...shape.details().map(line => `  ${line}`)];
  }
}

