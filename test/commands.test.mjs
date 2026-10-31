import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Editor } from '../dist/application/Editor.js';
import { Interpreter } from '../dist/cli/Interpreter.js';
import { Tokenizer } from '../dist/cli/Tokenizer.js';

const setup = () => {
  const files = { read() { throw new Error('cannot read file: missing.svg'); }, write() {} };
  const codec = { encode: () => '<svg/>', decode() { throw new Error('invalid SVG'); } };
  const editor = new Editor(files, codec); const cli = new Interpreter(editor);
  const run = line => cli.execute(line).join('\n');
  return {editor, run, files};
};

test('comments, hex colors, empty quotes and escaped quotes tokenize correctly', () => {
  const t = new Tokenizer();
  assert.deepEqual(t.tokenize('  # note'), []);
  assert.deepEqual(t.tokenize('set r fill #abc'), ['set','r','fill','#abc']);
  assert.deepEqual(t.tokenize('create text t 0 0 ""'), ['create','text','t','0','0','']);
  assert.deepEqual(t.tokenize('set t text "Hello \\"SVG\\""'), ['set','t','text','Hello "SVG"']);
  assert.throws(()=>t.tokenize('set t text "bad'), /unterminated/);
});

test('help works before init; required errors and styles are enforced', () => {
  const {run} = setup();
  assert.match(run('help'), /create ellipse/);
  assert.equal(run('tree'), "error: no document. use 'init' or 'read' first");
  assert.equal(run('init'), 'canvas 800x600 created');
  assert.equal(run('undo'), 'error: undo not allowed after io command');
  assert.equal(run('create rect r 1 2 3 4'), 'rect#r created');
  assert.equal(run('create circle r 0 0 2'), 'error: id already exists: r');
  assert.equal(run('create rect a 0 0 1 1 in absent'), 'error: no such container: absent');
  assert.equal(run('create g child in r'), 'error: not a container: r');
  assert.equal(run('move nope 1 2'), 'error: no such shape: nope');
  assert.equal(run('set r font-size 12'), 'error: unknown attribute: font-size');
  assert.equal(run('scale r 0'), 'error: scale factor must be positive');
  assert.equal(run('create box b'), 'error: unknown shape type: box (is the plugin loaded?)');
  assert.doesNotMatch(run('show r'), /fill=/);
});

test('all edit commands undo and redo as whole transactions', () => {
  const {run} = setup();
  for (const line of ['init','create g scene','create g inner in scene',
    'create rect r 1 2 3 4 in inner','create circle c 5 6 7 red in inner']) run(line);
  for (const line of ['move scene 2 3', 'scale scene 2', 'set scene fill blue',
    'set r width 10', 'front r', 'back c', 'group pair c r', 'ungroup pair',
    'addto scene r', 'delete inner']) {
    const before = run('tree');
    assert.doesNotMatch(run(line), /^error:/, line);
    const after = run('tree');
    assert.match(run('undo'), /^undone:/, line); assert.equal(run('tree'), before, line);
    assert.match(run('redo'), /^redone:/, line); assert.equal(run('tree'), after, line);
  }
});

test('failed commands preserve document, undo stack, redo stack and io lock', () => {
  const {run, files} = setup();
  run('init'); run('create rect r 1 2 3 4'); run('move r 5 6'); run('undo');
  const before = run('tree');
  for (const line of ['scale r -1','create g r','group x r absent','set r width NaN',
    'canvas 0 3','read missing.svg','init -1','create text t 1 2 "bad']) {
    assert.match(run(line), /^error:/); assert.equal(run('tree'), before);
  }
  files.write = () => { throw new Error('cannot write file: bad.svg'); };
  assert.equal(run('save bad.svg'), 'error: cannot write file: bad.svg');
  assert.match(run('redo'), /^redone:/);
  run('undo'); run('set r fill red'); assert.equal(run('redo'), 'error: nothing to redo');
  files.write = () => {};
  run('save ok.svg'); assert.equal(run('undo'), 'error: undo not allowed after io command');
  run('tree'); run('show r'); run('canvas'); run('help'); run('scale r 0');
  assert.equal(run('redo'), 'error: undo not allowed after io command');
  run('move r 1 1'); assert.match(run('undo'), /^undone:/);
  assert.equal(run('undo'), 'error: nothing to undo');
  run('canvas 900 700'); assert.equal(run('undo'), 'error: undo not allowed after io command');
});

test('overflow halfway through a composite operation rolls back every child', () => {
  const {run} = setup(); run('init'); run('create g scene');
  run('create rect a 1 2 3 4 in scene'); run('create circle b 1e308 0 2 in scene');
  const before = run('tree');
  assert.match(run('scale scene 10'), /^error:/); assert.equal(run('tree'), before);
  run('undo'); assert.equal(run('show b'), 'error: no such shape: b');
});
