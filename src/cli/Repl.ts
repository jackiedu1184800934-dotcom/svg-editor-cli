import { createInterface } from 'node:readline';
import type { Readable, Writable } from 'node:stream';
import { Interpreter } from './Interpreter.js';

export class Repl {
  constructor(private readonly interpreter: Interpreter) {}
  async run(input: Readable, output: Writable, interactive: boolean): Promise<void> {
    const lines = createInterface({ input, output, terminal: interactive, crlfDelay: Infinity });
    let closed = false;
    lines.on('close', () => { closed = true; });
    if (interactive) {
      output.write("svg-editor 0.1 — type 'help' for commands\n\n");
      lines.setPrompt('svg> '); lines.prompt();
    }
    for await (const line of lines) {
      for (const result of this.interpreter.execute(line)) output.write(`${result}\n`);
      if (interactive && !closed) lines.prompt();
    }
  }
}
