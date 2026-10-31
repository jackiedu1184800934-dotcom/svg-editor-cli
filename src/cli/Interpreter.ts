import { Editor } from '../application/Editor.js';
import { CommandRegistry } from './CommandRegistry.js';
import { Tokenizer } from './Tokenizer.js';

export class Interpreter {
  readonly #tokenizer = new Tokenizer();
  readonly #commands = new CommandRegistry();
  constructor(private readonly editor: Editor) {}
  execute(line: string): readonly string[] {
    try {
      const tokens = this.#tokenizer.tokenize(line);
      if (!tokens.length) return [];
      return this.#commands.create(tokens[0]!, tokens.slice(1)).execute(this.editor);
    } catch (error) {
      // A malformed argument or XML parser message must remain one error line.
      const message = error instanceof Error ? error.message : String(error);
      return [`error: ${message.replace(/[\r\n\u2028\u2029]+/g, ' ')}`];
    }
  }
}
