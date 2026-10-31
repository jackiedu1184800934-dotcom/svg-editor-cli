import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';

const sources = readdirSync('src', {recursive:true}).filter(path=>path.endsWith('.ts'));
test('production classes use one class per file with matching file names', () => {
  for (const path of sources) {
    const source = readFileSync(join('src',path),'utf8');
    const classes = [...source.matchAll(/export\s+(?:abstract\s+)?class\s+(\w+)/g)].map(m=>m[1]);
    assert.ok(classes.length <= 1,path);
    if (classes.length) assert.equal(classes[0],basename(path,'.ts'),path);
  }
});
test('all production imports obey the documented layer directions', () => {
  for (const path of sources) {
    const layer = path.split('/')[0]; const source = readFileSync(join('src',path),'utf8');
    for (const [,target] of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      const allowed = {domain:['domain'],application:['application','domain'],
        infrastructure:['infrastructure','application','domain'],cli:['cli','application']}[layer];
      if (target.startsWith('.')) {
        const destination = relative(resolve('src'),resolve('src',dirname(path),target)).split('/')[0];
        assert.ok(allowed.includes(destination) || path === 'cli/Main.ts' && destination === 'infrastructure', `${path} -> ${target}`);
      } else assert.ok(['infrastructure','cli'].includes(layer), `${path} imports external ${target}`);
    }
    assert.doesNotMatch(source, /\bswitch\s*\(/, `${path}: use polymorphism, not switch dispatch`);
  }
});
