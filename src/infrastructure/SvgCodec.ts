import { DOMImplementation, DOMParser, XMLSerializer } from '@xmldom/xmldom';
import type { Element, Document } from '@xmldom/xmldom';
import type { DrawingCodec } from '../application/DrawingCodec.js';
import { Drawing } from '../domain/Drawing.js';
import { Group } from '../domain/Group.js';
import { Shape } from '../domain/Shape.js';
import { ShapeFactory } from '../domain/ShapeFactory.js';
import { Value } from '../domain/Value.js';
import { ImportTransform } from './ImportTransform.js';

export class SvgCodec implements DrawingCodec {
  private readonly namespace = 'http://www.w3.org/2000/svg';
  private readonly factory = new ShapeFactory();

  decode(source: string): { drawing: Drawing; warnings: readonly string[] } {
    Value.text(source);
    if (/<!DOCTYPE|<!ENTITY/i.test(source)) throw new Error('invalid SVG: DTD and custom entities are not supported');
    let xml: Document;
    try {
      xml = new DOMParser({ onError: (_level, message) => { throw new Error(message); } })
        .parseFromString(source, 'image/svg+xml');
    } catch (error) { throw new Error(`invalid SVG: ${error instanceof Error ? error.message : String(error)}`); }
    const root = xml.documentElement;
    if (!root || root.localName !== 'svg' || (root.namespaceURI && root.namespaceURI !== this.namespace)) {
      throw new Error('invalid SVG: expected <svg> root');
    }
    const width = this.length(root.getAttribute('width') || '800', 'canvas width');
    const height = this.length(root.getAttribute('height') || '600', 'canvas height');
    const drawing = new Drawing(width, height);
    // Phase 1 uses a one-to-one px viewport. Reject unhandled attributes, never silently lose them.
    for (const attr of Array.from(root.attributes)) {
      if (!['width','height','viewBox','xmlns','version'].includes(attr.name)) throw new Error(`unsupported SVG root attribute: ${attr.name}`);
    }
    const viewBox = root.getAttribute('viewBox');
    if (viewBox) {
      const values = viewBox.trim().split(/[\s,]+/).map(value => Value.number(value, 'viewBox'));
      if (values.length !== 4 || values.some((value, i) => value !== [0, 0, width, height][i])) {
        throw new Error('unsupported viewBox: expected 0 0 width height');
      }
    }
    const reserved = new Set<string>();
    for (const element of Array.from(root.getElementsByTagName('*'))) {
      const id = element.getAttribute('id');
      if (id) {
        Value.id(id);
        if (reserved.has(id)) throw new Error(`id already exists: ${id}`);
        reserved.add(id);
      }
    }
    const warnings: string[] = [];
    for (const element of this.elements(root)) drawing.add(this.readElement(element, reserved, warnings, new ImportTransform(), new Map(), 0));
    return { drawing, warnings };
  }

  private length(source: string, label: string): number { return Value.number(source.replace(/px$/, ''), label); }

  private elements(parent: Element): Element[] {
    return Array.from(parent.childNodes).filter(node => node.nodeType === 1) as Element[];
  }

  private readElement(element: Element, reserved: Set<string>, warnings: string[],
    parentTransform: ImportTransform, inherited: ReadonlyMap<string, string>, depth: number): Shape {
    if (depth > 256) throw new Error('SVG nesting exceeds 256 levels');
    if (element.namespaceURI && element.namespaceURI !== this.namespace) throw new Error('foreign SVG namespace is not supported');
    const type = element.localName ?? element.tagName;
    let id = element.getAttribute('id');
    if (!id) {
      let sequence = 1; while (reserved.has(`${type}${sequence}`)) sequence++;
      id = `${type}${sequence}`; reserved.add(id);
      warnings.push(`warning: assigned id ${id} to unnamed <${type}>`);
    }
    const attributes = new Map(Array.from(element.attributes, attr => [attr.name, attr.value]));
    const transform = parentTransform.combine(ImportTransform.parse(attributes.get('transform') ?? ''));
    attributes.delete('transform');
    const shape = this.factory.read(type, id, attributes, element.textContent ?? '');
    const effective = new Map([...inherited, ...attributes]);
    const children = this.elements(element);
    if (shape instanceof Group) {
      for (const node of Array.from(element.childNodes)) {
        if ((node.nodeType === 3 || node.nodeType === 4) && node.nodeValue?.trim()) throw new Error('unexpected text in SVG group');
      }
      for (const child of children) shape.insert(this.readElement(child, reserved, warnings, transform, effective, depth + 1));
    } else {
      if (children.length) throw new Error(`nested elements are not supported in <${type}>`);
      shape.scale(transform.scaleFactor); shape.move(transform.offsetX, transform.offsetY);
      if (transform.scaleFactor !== 1) {
        shape.set('stroke-width', String(this.length(effective.get('stroke-width') ?? '1', 'stroke-width') * transform.scaleFactor));
        if (shape.textContent !== undefined) shape.readAttribute('font-size', String(this.length(effective.get('font-size') ?? '16', 'font-size') * transform.scaleFactor));
      }
    }
    return shape;
  }

  encode(drawing: Drawing): string {
    const xml = new DOMImplementation().createDocument(this.namespace, 'svg', null);
    const root = xml.documentElement!;
    root.setAttribute('xmlns', this.namespace);
    root.setAttribute('width', String(drawing.width)); root.setAttribute('height', String(drawing.height));
    root.setAttribute('viewBox', `0 0 ${drawing.width} ${drawing.height}`);
    for (const shape of drawing.children) root.appendChild(this.writeElement(xml, shape));
    return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(xml)}\n`;
  }

  private writeElement(xml: Document, shape: Shape): Element {
    const element = xml.createElementNS(this.namespace, shape.type);
    for (const [key, value] of shape.attributes) element.setAttribute(key, value);
    if (shape.textContent !== undefined) element.appendChild(xml.createTextNode(shape.textContent));
    for (const child of shape.children) element.appendChild(this.writeElement(xml, child));
    return element;
  }
}
