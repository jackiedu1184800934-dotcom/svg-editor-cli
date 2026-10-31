import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { Editor } from '../dist/application/Editor.js';
import { Interpreter } from '../dist/cli/Interpreter.js';
import { NodeFileStore } from '../dist/infrastructure/NodeFileStore.js';
import { SvgCodec } from '../dist/infrastructure/SvgCodec.js';

for (const scenario of ['flowchart', 'session']) test(`real CLI replays the assignment ${scenario} transcript`, () => {
  const dir = mkdtempSync(join(tmpdir(), 'svg-acceptance-'));
  try {
    mkdirSync(join(dir,'examples')); copyFileSync('examples/other.svg',join(dir,'examples/other.svg'));
    const result = spawnSync(process.execPath, [resolve('dist/cli/Main.js')], {
      cwd: dir, input: readFileSync(`examples/${scenario}.commands`,'utf8'), encoding:'utf8', timeout:10000
    });
    assert.equal(result.status, 0, result.stderr); assert.equal(result.stderr, '');
    const codec = new SvgCodec();
    if (scenario === 'flowchart') {
      assert.doesNotMatch(result.stdout, /^error:/m);
      const drawing = codec.decode(readFileSync(join(dir,'flowchart.svg'),'utf8')).drawing;
      assert.equal(drawing.all().length, 8);
      assert.equal(drawing.find('process').attributes.get('y'), '100');
      assert.equal(drawing.find('process-label').textContent, '处理数据 v2');
    } else {
      assert.deepEqual(result.stdout.split('\n').filter(l=>l.startsWith('error:')), [
        'error: cannot group a container into its own descendant: markers',
        'error: undo not allowed after io command'
      ]);
      assert.match(result.stdout, /warning: assigned id rect1 to unnamed <rect>/);
      assert.match(result.stdout, /read examples\/other.svg \(7 elements\)/);
      assert.equal(codec.decode(readFileSync(join(dir,'demo.svg'),'utf8')).drawing.all().length, 5);
    }
  } finally { rmSync(dir,{recursive:true,force:true}); }
});

test('a long deterministic edit sequence restores every prior state then replays exactly', () => {
  const codec = new SvgCodec(); const editor = new Editor(new NodeFileStore(), codec);
  const cli = new Interpreter(editor); const run = line => cli.execute(line).join('\n');
  run('init'); run('create g scene');
  for (let i=0;i<8;i++) run(`create rect r${i} ${i} ${i*2} 10 20 in scene`);
  const states = [codec.encode(editor.current())];
  for (let i=0;i<80;i++) {
    const commands = [`move r${i%8} 1.25 -0.5`, `scale r${i%8} 1.1`, `set r${i%8} fill #abc`,
      `front r${i%8}`, `back r${i%8}`];
    assert.doesNotMatch(run(commands[i%commands.length]), /^error:/);
    states.push(codec.encode(editor.current()));
  }
  for (let i=79;i>=0;i--) { run('undo'); assert.equal(codec.encode(editor.current()), states[i]); }
  for (let i=1;i<states.length;i++) { run('redo'); assert.equal(codec.encode(editor.current()), states[i]); }
});

test('attribute whitelist and decimal/Unicode geometry are checked for every concrete type', () => {
  const editor = new Editor(new NodeFileStore(), new SvgCodec()); const cli = new Interpreter(editor);
  const run = line => cli.execute(line).join('\n'); run('init');
  const cases = [
    ['rect','矩形','1.5 -2 3 4', ['x','y','width','height']],
    ['circle','circle','1 2 3',['cx','cy','r']],
    ['ellipse','ellipse','1 2 3 4',['cx','cy','rx','ry']],
    ['line','line','1 2 3 4',['x1','y1','x2','y2']],
    ['text','text','1 2 "你好 SVG"',['x','y']],
    ['g','g','',[]]
  ];
  for (const [type,id,args,properties] of cases) {
    assert.doesNotMatch(run(`create ${type} ${id} ${args}`), /^error:/);
    for (const attr of ['fill','stroke','stroke-width',...properties]) {
      assert.doesNotMatch(run(`set ${id} ${attr} 2.5`), /^error:/);
    }
    assert.equal(run(`set ${id} id changed`), 'error: unknown attribute: id');
  }
  run('set text text ""'); assert.equal(editor.current().find('text').textContent, '');
  assert.match(run('tree 矩形'), /^rect#矩形/);
  run('create g Case'); run('create g case'); assert.equal(editor.current().all().length, 8);
});
