import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { SvgCodec } from '../dist/infrastructure/SvgCodec.js';
import { NodeFileStore } from '../dist/infrastructure/NodeFileStore.js';
import { Editor } from '../dist/application/Editor.js';
import { Interpreter } from '../dist/cli/Interpreter.js';

const codec = new SvgCodec();
const wrap = body => `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">${body}</svg>`;

test('auto ids reserve later explicit ids and warnings follow document order', () => {
  const result = codec.decode(wrap('<rect/><rect id="rect1"/><g><circle/><text x="2" y="4">中文 &amp; SVG</text></g>'));
  assert.deepEqual(result.drawing.all().map(s=>s.id), ['rect2','rect1','g1','circle1','text1']);
  assert.deepEqual(result.warnings, [
    'warning: assigned id rect2 to unnamed <rect>', 'warning: assigned id g1 to unnamed <g>',
    'warning: assigned id circle1 to unnamed <circle>', 'warning: assigned id text1 to unnamed <text>'
  ]);
  assert.equal(result.drawing.find('text1').textContent, '中文 & SVG');
  assert.equal(codec.decode(codec.encode(result.drawing)).warnings.length, 0);
});

test('all shapes, hierarchy, styles, ids and XML special characters round-trip', () => {
  const {drawing} = codec.decode(wrap('<g id="scene" fill="red"><rect id="r" x="-1.5" y="2" width="3" height="4"/>'+
    '<circle id="c" cx="5" cy="6" r="7"/><ellipse id="e" cx="1" cy="2" rx="3" ry="4"/>'+
    '<line id="l" x1="1" y1="2" x2="3" y2="4" stroke="black"/>'+
    '<text id="t" x="5" y="6">&lt;XML&gt; &amp; "中文"</text></g>'));
  const saved = codec.encode(drawing); const reread = codec.decode(saved).drawing;
  assert.equal(codec.encode(reread), saved);
  assert.match(saved, /&lt;XML&gt; &amp;/);
  assert.equal(reread.find('t').textContent, '<XML> & "中文"');
  assert.equal(reread.parentLabel('c'), 'g#scene');
  assert.equal(reread.find('r').attributes.has('fill'), false);
  assert.equal(reread.find('scene').attributes.get('fill'), 'red');
});

test('translate and uniform scale from the assignment normalize nested coordinates', () => {
  const {drawing} = codec.decode(wrap('<g id="outer" transform="translate(60,40)"><g id="inner" transform="translate(200,0) scale(0.8)">'+
    '<rect id="r" x="0" y="0" width="120" height="60"/><text id="t" x="60" y="38" font-size="16" text-anchor="middle">End</text></g></g>'));
  assert.equal(drawing.find('r').attributes.get('x'), '260');
  assert.equal(drawing.find('r').attributes.get('width'), '96');
  assert.equal(drawing.find('t').attributes.get('x'), '308');
  assert.equal(drawing.find('t').attributes.get('font-size'), '12.8');
  assert.equal(drawing.clone().find('t').attributes.get('text-anchor'), 'middle');
  assert.doesNotMatch(codec.encode(drawing), /transform=/);
});

for (const [name, source, message] of [
  ['duplicate IDs', wrap('<rect id="r"/><g id="r"/>'), /id already exists: r/],
  ['bad XML', '<svg><rect></svg>', /invalid SVG/],
  ['unknown shape', wrap('<path id="p"/>'), /unknown shape type: path/],
  ['unknown property', wrap('<rect id="r" bogus="5"/>'), /unknown attribute: bogus/],
  ['external entities', '<!DOCTYPE svg [<!ENTITY file SYSTEM "file:///secret">]><svg/>', /DTD/],
  ['nonfinite number', wrap('<rect id="r" x="NaN"/>'), /finite number/],
  ['negative radius', wrap('<circle id="c" r="-1"/>'), /nonnegative/],
  ['foreign namespace', '<svg xmlns="wrong"/>', /expected <svg>/],
  ['mismatched viewport', '<svg width="400" height="300" viewBox="1 0 400 300"/>', /unsupported viewBox/],
  ['unsupported transform', wrap('<g id="g" transform="rotate(30)"/>'), /unsupported SVG transform/],
  ['unexpected root text', wrap('unexpected'), /unexpected text/],
  ['unexpected shape text', wrap('<rect id="r">unexpected</rect>'), /unexpected text/],
]) test(`reader rejects ${name} explicitly`, () => assert.throws(()=>codec.decode(source), message));

test('real file save/read, default path, I/O barriers and failed I/O are atomic', () => {
  const dir = mkdtempSync(join(tmpdir(), 'svg-editor-'));
  try {
    const file = join(dir,'drawing with spaces.svg'); const files = new NodeFileStore();
    const cli = new Interpreter(new Editor(files, codec)); const run = s => cli.execute(s).join('\n');
    run('init 400 300'); run('create text t 1 2 "A & B"');
    assert.match(run(`save "${file}"`), /^saved to/);
    assert.equal(run('undo'), 'error: undo not allowed after io command');
    run('set t text "changed"'); run('save');
    assert.match(readFileSync(file, 'utf8'), /changed/);
    run('init'); run(`read "${file}"`); assert.match(run('show t'), /changed/);
    assert.equal(run('redo'), 'error: undo not allowed after io command');
    run('move t 1 1'); const before = run('tree');
    const bad = join(dir,'broken.svg'); writeFileSync(bad, '<svg><broken>');
    assert.match(run(`read "${bad}"`), /^error:/); assert.equal(run('tree'), before);
    assert.match(run('undo'), /^undone:/);
    run('redo'); const missing = join(dir,'missing.svg');
    assert.equal(run(`read "${missing}"`), `error: cannot read file: ${missing}`);
    const blocked = join(dir,'a-directory.svg'); mkdirSync(blocked);
    assert.equal(run(`save "${blocked}"`), `error: cannot write file: ${blocked}`);
    assert.equal(readdirSync(dir).some(f=>f.endsWith('.tmp')), false);
    assert.equal(run('tree'), before); assert.match(run('undo'), /^undone:/);
    run('save'); assert.match(readFileSync(file, 'utf8'), /changed/);
  } finally { rmSync(dir, {recursive:true, force:true}); }
});
