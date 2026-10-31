import { Drawing } from '../domain/Drawing.js';
import type { DrawingCodec } from './DrawingCodec.js';
import type { FileStore } from './FileStore.js';
import { EditCommand } from './EditCommand.js';
import { History } from './History.js';

export class Editor {
  #drawing?: Drawing;
  #path?: string;
  readonly #history = new History();
  constructor(private readonly files: FileStore, private readonly codec: DrawingCodec) {}
  current(): Drawing {
    if (!this.#drawing) throw new Error("no document. use 'init' or 'read' first");
    return this.#drawing.clone();
  }
  init(width: number, height: number): readonly string[] {
    const drawing = new Drawing(width, height);
    this.#drawing = drawing; this.#path = undefined; this.#history.barrier();
    return [`canvas ${width}x${height} created`];
  }
  read(path: string): readonly string[] {
    const {drawing, warnings} = this.codec.decode(this.files.read(path));
    this.#drawing = drawing; this.#path = path; this.#history.barrier();
    return [...warnings, `read ${path} (${drawing.all().length} elements)`];
  }
  save(path?: string): readonly string[] {
    const drawing = this.current(); const destination = path ?? this.#path;
    if (!destination) throw new Error('no file path. use save <file.svg>');
    this.files.write(destination, this.codec.encode(drawing));
    this.#path = destination; this.#history.barrier();
    return [`saved to ${destination} (${drawing.all().length} elements)`];
  }
  canvas(width?: number, height?: number): readonly string[] {
    const drawing = this.current();
    if (width === undefined || height === undefined) return [`canvas ${drawing.width}x${drawing.height}`];
    drawing.resize(width, height);
    this.#drawing = drawing; this.#history.barrier();
    return [`canvas resized to ${width}x${height}`];
  }
  edit(command: EditCommand): readonly string[] {
    this.#drawing = this.#history.execute(command, this.current());
    return [command.summary];
  }
  undo(): readonly string[] {
    this.current(); const change = this.#history.undo(); this.#drawing = change.drawing; return [change.summary];
  }
  redo(): readonly string[] {
    this.current(); const change = this.#history.redo(); this.#drawing = change.drawing; return [change.summary];
  }
}
