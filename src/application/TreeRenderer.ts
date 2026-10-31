import { Drawing } from '../domain/Drawing.js';
import { Shape } from '../domain/Shape.js';

export class TreeRenderer {
  render(drawing: Drawing, id?: string): string[] {
    const root = id ? drawing.find(id) : undefined;
    const lines = [root ? root.summary() : `svg (${drawing.width}x${drawing.height})`];
    this.children(root ? root.children : drawing.children, '', lines);
    return lines;
  }
  private children(shapes: readonly Shape[], prefix: string, lines: string[]): void {
    for (const [index, shape] of shapes.entries()) {
      const last = index === shapes.length - 1;
      lines.push(`${prefix}${last ? '└── ' : '├── '}${shape.summary()}`);
      this.children(shape.children, prefix + (last ? '    ' : '│   '), lines);
    }
  }
}
