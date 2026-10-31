import type { Command } from '../Command.js';
import { Editor } from '../Editor.js';
import { Arguments } from '../Arguments.js';

export class CanvasCommand implements Command {
  constructor(private readonly args: Arguments) {}
  execute(editor: Editor): readonly string[] {
    this.args.count(0, 2, 'canvas [w] [h]');
    if (this.args.values.length === 1) throw new Error('usage: canvas [w] [h]');
    return this.args.values.length ? editor.canvas(this.args.number(0, 'canvas width'), this.args.number(1, 'canvas height')) : editor.canvas();
  }
}

