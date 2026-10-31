import type { Command } from '../Command.js';
import { Editor } from '../Editor.js';
import { Arguments } from '../Arguments.js';
import { TreeRenderer } from '../TreeRenderer.js';

export class TreeCommand implements Command {
  constructor(private readonly args: Arguments) {}
  execute(editor: Editor): readonly string[] {
    this.args.count(0, 1, 'tree [id]'); return new TreeRenderer().render(editor.current(), this.args.values[0]);
  }
}

