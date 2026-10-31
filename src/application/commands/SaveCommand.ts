import type { Command } from '../Command.js';
import { Editor } from '../Editor.js';
import { Arguments } from '../Arguments.js';

export class SaveCommand implements Command {
  constructor(private readonly args: Arguments) {}
  execute(editor: Editor): readonly string[] {
    this.args.count(0, 1, 'save [file.svg]'); return editor.save(this.args.values[0]);
  }
}

