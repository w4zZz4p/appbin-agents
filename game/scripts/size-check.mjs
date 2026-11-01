// Gzip size budgets from PROTOTYPE.md. Run after `npm run build`. Exits 1 if over budget.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = new URL('../dist/', import.meta.url).pathname;
const KB = 1024;
const BUDGET = { initial: 250 * KB, code: 80 * KB, audio: 300 * KB, total: 1536 * KB };

const files = [];
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : files.push(p); } };
walk(DIST);

let initial = 0, code = 0, audio = 0, total = 0;
for (const f of files) {
  const gz = gzipSync(readFileSync(f), { level: 9 }).length;
  const ext = extname(f);
  total += gz;
  if (['.js', '.css', '.html'].includes(ext) || /atlas/.test(f)) initial += gz;
  if (ext === '.js') code += gz;
  if (['.ogg', '.opus', '.mp3', '.m4a', '.wav'].includes(ext)) audio += gz;
  console.log(`${(gz / KB).toFixed(1).padStart(7)} KB  ${relative(DIST, f)}`);
}
let ok = true;
const row = (name, v, b) => { const pass = v <= b; ok &&= pass; console.log(`${pass ? 'PASS' : 'FAIL'}  ${name.padEnd(8)} ${(v / KB).toFixed(1)} KB / ${(b / KB).toFixed(0)} KB`); };
console.log('');
row('initial', initial, BUDGET.initial);
row('code', code, BUDGET.code);
row('audio', audio, BUDGET.audio);
row('total', total, BUDGET.total);
process.exit(ok ? 0 : 1);
