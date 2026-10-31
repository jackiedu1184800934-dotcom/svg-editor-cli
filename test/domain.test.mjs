import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Drawing } from '../dist/domain/Drawing.js';
import { ShapeFactory } from '../dist/domain/ShapeFactory.js';

const factory = new ShapeFactory();
test('six concrete shapes implement polymorphic movement, scaling and deep cloning', () => {
  const drawing = new Drawing();
  drawing.add(factory.create('g', 'scene', []));
  for (const [type, args] of [['rect', ['1','2','3','4']], ['circle', ['1','2','3']],
    ['ellipse', ['1','2','3','4']], ['line', ['1','2','3','4']], ['text', ['1','2','A & B']]]) {
    drawing.add(factory.create(type, type, args), 'scene');
  }
  const copy = drawing.clone();
  copy.find('scene').move(10, 20); copy.find('scene').scale(2);
  assert.equal(copy.find('rect').attributes.get('x'), '22');
  assert.equal(copy.find('line').attributes.get('x2'), '26');
  assert.equal(copy.find('circle').attributes.get('r'), '6');
  assert.equal(copy.find('text').textContent, 'A & B');
  assert.equal(drawing.find('rect').attributes.get('x'), '1');
});
test('group uses document order and lowest common parent; nested ungroup restores slots', () => {
  const d = new Drawing(); d.add(factory.create('g','scene',[]));
  for (const id of ['a','b','c']) d.add(factory.create('rect',id,['0','0','1','1']), 'scene');
  d.group('pair', ['c','a']);
  assert.deepEqual(d.find('pair').children.map(s=>s.id), ['a','c']);
  assert.deepEqual(d.find('scene').children.map(s=>s.id), ['pair','b']);
  d.ungroup('pair');
  assert.deepEqual(d.find('scene').children.map(s=>s.id), ['a','c','b']);
  assert.throws(()=>d.ungroup('scene'), /cannot ungroup top-level/);
  assert.throws(()=>d.group('bad',['scene','a']), /own descendant: scene/);
  assert.throws(()=>d.addTo('scene','scene'), /own descendant/);
});
test('validation and defensive collections preserve the domain invariants', () => {
  const d = new Drawing(); d.add(factory.create('rect', 'r', ['0','0','1','1']));
  assert.throws(()=>d.add(factory.create('g','r',[])), /id already exists: r/);
  assert.throws(()=>d.find('r').set('r','2'), /unknown attribute: r/);
  assert.throws(()=>d.find('r').set('width','-1'), /nonnegative/);
  assert.throws(()=>factory.create('box','b',[]), /unknown shape type: box/);
  const attrs = d.find('r').attributes; attrs.set('width', '-1');
  assert.equal(d.find('r').attributes.get('width'), '1');
  assert.equal(d.children.pop().id, 'r'); assert.equal(d.children.length, 1);
});
