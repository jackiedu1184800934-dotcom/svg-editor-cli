import { Editor } from '../application/Editor.js';
import { NodeFileStore } from '../infrastructure/NodeFileStore.js';
import { SvgCodec } from '../infrastructure/SvgCodec.js';
import { Interpreter } from './Interpreter.js';
import { Repl } from './Repl.js';

/** Composition root: the only CLI class that imports infrastructure. */
export class Main {
  async run(): Promise<void> {
    const editor = new Editor(new NodeFileStore(), new SvgCodec());
    await new Repl(new Interpreter(editor)).run(process.stdin, process.stdout, Boolean(process.stdin.isTTY));
  }
}
await new Main().run();
