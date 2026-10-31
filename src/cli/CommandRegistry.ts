import type { Command } from '../application/Command.js';
import { Arguments } from '../application/Arguments.js';
import { HelpCommand } from '../application/commands/HelpCommand.js';
import { InitCommand } from '../application/commands/InitCommand.js';
import { ReadCommand } from '../application/commands/ReadCommand.js';
import { SaveCommand } from '../application/commands/SaveCommand.js';
import { CanvasCommand } from '../application/commands/CanvasCommand.js';
import { CreateCommand } from '../application/commands/CreateCommand.js';
import { DeleteCommand } from '../application/commands/DeleteCommand.js';
import { MoveCommand } from '../application/commands/MoveCommand.js';
import { ScaleCommand } from '../application/commands/ScaleCommand.js';
import { SetCommand } from '../application/commands/SetCommand.js';
import { GroupCommand } from '../application/commands/GroupCommand.js';
import { UngroupCommand } from '../application/commands/UngroupCommand.js';
import { AddToCommand } from '../application/commands/AddToCommand.js';
import { FrontCommand } from '../application/commands/FrontCommand.js';
import { BackCommand } from '../application/commands/BackCommand.js';
import { TreeCommand } from '../application/commands/TreeCommand.js';
import { ShowCommand } from '../application/commands/ShowCommand.js';
import { UndoCommand } from '../application/commands/UndoCommand.js';
import { RedoCommand } from '../application/commands/RedoCommand.js';

/** Name-dispatch site 2/2. Phase 2: expose command registration as a plugin port. */
export class CommandRegistry {
  readonly #commands = new Map<string, { usage: string; create: (args: Arguments) => Command }>([
    ['init', { usage: 'init [w] [h]', create: args => new InitCommand(args) }],
    ['read', { usage: 'read <file.svg>', create: args => new ReadCommand(args) }],
    ['save', { usage: 'save [file.svg]', create: args => new SaveCommand(args) }],
    ['canvas', { usage: 'canvas [w] [h]', create: args => new CanvasCommand(args) }],
    ['create', { usage: 'create <type> <id> [params...] [in <containerId>]', create: args => new CreateCommand(args) }],
    ['delete', { usage: 'delete <id>', create: args => new DeleteCommand(args) }],
    ['move', { usage: 'move <id> <dx> <dy>', create: args => new MoveCommand(args) }],
    ['scale', { usage: 'scale <id> <factor>', create: args => new ScaleCommand(args) }],
    ['set', { usage: 'set <id> <attr> <value>', create: args => new SetCommand(args) }],
    ['group', { usage: 'group <newGid> <id1> <id2>...', create: args => new GroupCommand(args) }],
    ['ungroup', { usage: 'ungroup <gid>', create: args => new UngroupCommand(args) }],
    ['addto', { usage: 'addto <gid> <id>', create: args => new AddToCommand(args) }],
    ['front', { usage: 'front <id>', create: args => new FrontCommand(args) }],
    ['back', { usage: 'back <id>', create: args => new BackCommand(args) }],
    ['tree', { usage: 'tree [id]', create: args => new TreeCommand(args) }],
    ['show', { usage: 'show <id>', create: args => new ShowCommand(args) }],
    ['undo', { usage: 'undo', create: args => new UndoCommand(args) }],
    ['redo', { usage: 'redo', create: args => new RedoCommand(args) }],
    ['help', { usage: 'help', create: args => new HelpCommand(args, this.usages()) }],
  ]);
  private usages(): string[] { return Array.from(this.#commands.values(), entry => entry.usage); }
  create(name: string, args: readonly string[]): Command {
    const entry = this.#commands.get(name);
    if (!entry) throw new Error(`unknown command: ${name}`);
    return entry.create(new Arguments(args));
  }
}

