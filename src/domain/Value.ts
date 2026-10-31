/** Shared value validation; never performs I/O or dispatches on shape names. */
export class Value {
  static number(value: string | number, label: string): number {
    const source = String(value);
    if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(source)) {
      throw new Error(`${label} must be a finite number`);
    }
    const result = Number(value);
    if (!Number.isFinite(result)) throw new Error(`${label} must be a finite number`);
    return Object.is(result, -0) ? 0 : result;
  }

  static nonnegative(value: string | number, label: string): number {
    const result = this.number(value, label);
    if (result < 0) throw new Error(`${label} must be nonnegative`);
    return result;
  }

  static positive(value: string | number, label: string): number {
    const result = this.number(value, label);
    if (result <= 0) throw new Error(`${label} must be positive`);
    return result;
  }

  static text(value: string): string {
    if (/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/u.test(value)) {
      throw new Error('invalid XML character');
    }
    return value;
  }

  static id(value: string): string {
    this.text(value);
    if (!value || /\s/.test(value)) throw new Error('id must be nonempty and contain no whitespace');
    return value;
  }
}
