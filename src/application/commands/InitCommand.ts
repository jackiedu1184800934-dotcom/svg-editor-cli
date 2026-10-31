import type { Command } from '../Command.js';
import { Editor } from '../Editor.js';
import { Arguments } from '../Arguments.js';

export class InitCommand implements Command {
  constructor(private readonly args: Arguments) {}
  execute(editor: Editor): readonly string[] {
    this.args.count(0, 2, 'init [w] [h]');
    return editor.init(this.args.values.length ? this.args.number(0, 'canvas width') : 800,
      this.args.values.length > 1 ? this.args.number(1, 'canvas height') : 600);
  }
}

