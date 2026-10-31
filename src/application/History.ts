import { Drawing } from '../domain/Drawing.js';
import { EditCommand } from './EditCommand.js';

export class History {
  #undo: EditCommand[] = [];
  #redo: EditCommand[] = [];
  #locked = true;
  execute(command: EditCommand, drawing: Drawing): Drawing {
    const next = command.run(drawing); // No history mutation until every edit succeeds.
    this.#undo.push(command); this.#redo = []; this.#locked = false;
    return next;
  }
  barrier(): void { this.#undo = []; this.#redo = []; this.#locked = true; }
  private assertUnlocked(): void {
    if (this.#locked) throw new Error('undo not allowed after io command');
  }
  undo(): { drawing: Drawing; summary: string } {
    this.assertUnlocked();
    const command = this.#undo.at(-1);
    if (!command) throw new Error('nothing to undo');
    const drawing = command.undo(); this.#undo.pop(); this.#redo.push(command);
    return { drawing, summary: `undone: ${command.summary}` };
  }
  redo(): { drawing: Drawing; summary: string } {
    this.assertUnlocked();
    const command = this.#redo.at(-1);
    if (!command) throw new Error('nothing to redo');
    const drawing = command.redo(); this.#redo.pop(); this.#undo.push(command);
    return { drawing, summary: `redone: ${command.summary}` };
  }
}
