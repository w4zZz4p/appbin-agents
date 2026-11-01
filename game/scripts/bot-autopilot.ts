// P0 bot check over 1,000 seeds (PROTOTYPE.md):
//  - a perfect bot finds a passable lane on 100% of seeds (both arms, both lines)
//  - first lantern on the safe line within 5 s
//  - greedy-narrow vs safe-wide expected scores within ~20%, using imperfect bots
// Run: npm run bot [-- seeds]
import { Bot, runBot } from '../src/sim/bot.ts';

declare const process: { argv: string[]; exit(code: number): never };
import { TICK_HZ } from '../src/sim/tuning.ts';

const N = Number(process.argv[2] ?? 1000);
const TICKS = 90 * TICK_HZ;
let failed = false;

const pass = (label: string, lanes: boolean, mode: 'safe' | 'narrow') => {
  const dead: number[] = [];
  let slowLantern = 0;
  for (let s = 1; s <= N; s++) {
    const r = runBot(s, lanes, new Bot(mode), TICKS);
    if (!r.alive) dead.push(s);
    if (mode === 'safe' && (r.firstLanternTick < 0 || r.firstLanternTick > 5 * TICK_HZ)) slowLantern++;
  }
  const ok = dead.length === 0 && slowLantern === 0;
  if (!ok) failed = true;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}: survived ${N - dead.length}/${N}` +
    (mode === 'safe' ? `, first lantern > 5 s on ${slowLantern} seeds` : '') +
    (dead.length ? `  (first failing seeds: ${dead.slice(0, 10).join(', ')})` : ''));
};

pass('arm 0 safe line', false, 'safe');
pass('arm 1 wide line', true, 'safe');
pass('arm 1 narrow line', true, 'narrow');

console.log('\nExpected score, imperfect bots (arm 1, 90 s cap):');
console.log('aim error | safe-wide | greedy-narrow | ratio | median s (wide / narrow)');
for (const err of [10, 20, 30]) {
  const res: Record<string, { score: number; secs: number }> = {};
  for (const mode of ['safe', 'narrow'] as const) {
    const scores: number[] = [], secs: number[] = [];
    for (let s = 1; s <= N; s++) {
      const r = runBot(s, true, new Bot(mode, err, s), TICKS);
      scores.push(r.score);
      secs.push(r.ticks / TICK_HZ);
    }
    secs.sort((a, b) => a - b);
    res[mode] = { score: scores.reduce((a, b) => a + b, 0) / N, secs: secs[N >> 1] };
  }
  const ratio = res.narrow.score / res.safe.score;
  const ok = Math.abs(1 - ratio) <= 0.2;
  if (!ok) failed = true;
  console.log(`${String(err).padStart(6)} u  | ${res.safe.score.toFixed(0).padStart(9)} | ${res.narrow.score.toFixed(0).padStart(13)} | ${ratio.toFixed(2)}${ok ? '' : ' !'}  | ${res.safe.secs.toFixed(0)} / ${res.narrow.secs.toFixed(0)}`);
}
process.exit(failed ? 1 : 0);
