import type { Drawing } from '../domain/Drawing.js';

export interface DrawingCodec {
  decode(source: string): { drawing: Drawing; warnings: readonly string[] };
  encode(drawing: Drawing): string;
}
