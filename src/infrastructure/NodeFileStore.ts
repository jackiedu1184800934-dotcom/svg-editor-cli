import { accessSync, constants, existsSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, basename, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { FileStore } from '../application/FileStore.js';

export class NodeFileStore implements FileStore {
  read(path: string): string {
    try { return readFileSync(path, 'utf8'); }
    catch { throw new Error(`cannot read file: ${path}`); }
  }
  write(path: string, content: string): void {
    const temporary = join(dirname(path), `.${basename(path)}.${randomUUID()}.tmp`);
    try {
      if (existsSync(path)) accessSync(path, constants.W_OK);
      writeFileSync(temporary, content, { encoding: 'utf8', flag: 'wx' });
      renameSync(temporary, path);
    } catch {
      try { unlinkSync(temporary); } catch { /* Nothing created or already renamed. */ }
      throw new Error(`cannot write file: ${path}`);
    }
  }
}
