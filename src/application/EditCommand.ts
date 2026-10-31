import { Drawing } from '../domain/Drawing.js';
import type { Command } from './Command.js';
import type { Editor } from './Editor.js';

/** A concrete command owns behavior plus encapsulated before/after Mementos. */
export abstract class EditCommand implements Command {
  #before?: Drawing;
  #after?: Drawing;
  #summary = '';
  execute(editor: Editor): readonly string[] { return editor.edit(this); }
  protected abstract apply(drawing: Drawing): string;

  run(drawing: Drawing): Drawing {
    const working = drawing.clone();
    const summary = this.apply(working);
    this.#before = drawing.clone(); this.#after = working.clone(); this.#summary = summary;
    return working;
  }
  get summary(): string { return this.#summary; }
  undo(): Drawing {
    if (!this.#before) throw new Error('command has not executed');
    return this.#before.clone();
  }
  redo(): Drawing {
    if (!this.#after) throw new Error('command has not executed');
    return this.#after.clone();
  }
}
