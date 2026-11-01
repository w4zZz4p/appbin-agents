// Cross-browser golden test (R7): the same recordings must give the same state hash in
// Node and in every browser engine. Starts a Vite dev server and loads the sim modules
// directly in each browser.
// Usage: node tests/golden/golden.mjs [chromium firefox webkit]
import { createServer } from 'vite';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch { playwright = require('/opt/node-tools/node_modules/playwright'); }

const engines = process.argv.slice(2).length ? process.argv.slice(2) : ['chromium', 'firefox', 'webkit'];

// The workload runs identically in Node and in the browser.
async function workload(base) {
  const { Sim } = await import(base + '/src/sim/sim.ts');
  const { Bot } = await import(base + '/src/sim/bot.ts');
  const { Recorder, replay } = await import(base + '/src/sim/replay.ts');
  const { seedForDay } = await import(base + '/src/meta/daily.ts');
  const { encodeChallenge, decodeChallenge } = await import(base + '/src/meta/share.ts');
  const out = [];
  for (let i = 0; i < 12; i++) {
    const seed = seedForDay(20390 + i), lanes = i % 2 === 0;
    const sim = new Sim(seed, lanes), rec = new Recorder(), bot = new Bot(i % 3 ? 'narrow' : 'safe', 15 + i, i + 1, 6);
    while (sim.alive && sim.tick < 5400) { const inp = bot.input(sim); rec.push(inp); sim.step(inp); }
    const code = encodeChallenge({ simVersion: 1, day: 20390 + i, lanes, runs: rec.snapshot() });
    const back = replay(seed, lanes, decodeChallenge(code).runs);
    out.push([sim.hash, sim.tick, sim.score, back.hash, code.length].join(':'));
  }
  return out;
}

const server = await createServer({ root: new URL('../..', import.meta.url).pathname, server: { port: 5199, strictPort: true }, logLevel: 'error' });
await server.listen();
const origin = 'http://localhost:5199';
let failed = false;
try {
  const expected = await workload(new URL('../..', import.meta.url).pathname.replace(/\/$/, ''));
  console.log(`node      ${expected.length} runs`);
  for (const name of engines) {
    const browser = await playwright[name].launch();
    const page = await browser.newPage();
    await page.goto(origin + '/tests/golden/blank.html');
    const got = await page.evaluate(`(${workload.toString()})('')`);
    await browser.close();
    const bad = got.map((g, i) => (g === expected[i] ? null : `run ${i}: ${g} != ${expected[i]}`)).filter(Boolean);
    console.log(`${name.padEnd(9)} ${bad.length ? 'MISMATCH\n  ' + bad.join('\n  ') : 'match'}`);
    if (bad.length) failed = true;
  }
} finally {
  await server.close();
}
process.exit(failed ? 1 : 0);
