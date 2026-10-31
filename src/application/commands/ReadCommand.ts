import type { Command } from '../Command.js';
import { Editor } from '../Editor.js';
import { Arguments } from '../Arguments.js';

export class ReadCommand implements Command {
  constructor(private readonly args: Arguments) {}
  execute(editor: Editor): readonly string[] {
    this.args.count(1, 1, 'read <file.svg>'); return editor.read(this.args.at(0));
  }
}

