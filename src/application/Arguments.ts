import { Value } from '../domain/Value.js';

/** Validates arguments without owning any command-name dispatch. */
export class Arguments {
  constructor(private readonly tokens: readonly string[]) {}
  count(min: number, max: number, usage: string): void {
    if (this.tokens.length < min || this.tokens.length > max) throw new Error(`usage: ${usage}`);
  }
  at(index: number): string {
    const value = this.tokens[index];
    if (value === undefined) throw new Error('missing argument');
    return value;
  }
  number(index: number, label: string): number { return Value.number(this.at(index), label); }
  get values(): readonly string[] { return [...this.tokens]; }
}
