import { describe, expect, it } from 'vitest';
import { Bot, runBot } from '../../src/sim/bot.ts';
import { Prng } from '../../src/sim/prng.ts';
import { Sim } from '../../src/sim/sim.ts';
import { PulseState, MIN_PULSE_TICKS } from '../../src/input/pulse.ts';
import {
  BOAT_SCREEN_Y, FP, ROW, SPEED_RAMP, SPEED_START, TICK_HZ, VIEW_H, VISION_BASE_TICKS, FORK_NARROW_W,
} from '../../src/sim/tuning.ts';

const SEEDS = 200; // the full 1,000-seed check is `npm run bot`
const RUN_TICKS = 90 * TICK_HZ;

function scripted(seed: number, ticks: number): Sim {
  const sim = new Sim(seed, true);
  const rng = new Prng(seed * 31 + 7);
  let inp = 0;
  while (sim.alive && sim.tick < ticks) {
    if (sim.tick % 9 === 0) inp = rng.int(4);
    sim.step(inp);
  }
  return sim;
}

describe('determinism', () => {
  it('same seed and inputs give the same state hash', () => {
    for (const seed of [1, 42, 99999, 0xdeadbeef]) {
      const a = scripted(seed, 3000), b = scripted(seed, 3000);
      expect(a.hash).toBe(b.hash);
      expect([a.x, a.y, a.tick]).toEqual([b.x, b.y, b.tick]);
    }
  });

  it('golden hash is stable (update only on an intentional sim change)', () => {
    const sim = new Sim(12345, true);
    const bot = new Bot('narrow');
    while (sim.alive && sim.tick < 3600) sim.step(bot.input(sim));
    expect({ hash: sim.hash, tick: sim.tick, y: sim.y, lanterns: sim.lanterns }).toMatchSnapshot();
  });

  it('sim state stays integer', () => {
    const sim = scripted(7, 2000);
    for (const v of [sim.x, sim.y, sim.vx]) expect(Number.isInteger(v)).toBe(true);
  });
});

describe('passable-lane guarantee', () => {
  it.each([
    ['arm 0, safe line', false, 'safe'],
    ['arm 1, safe (wide) line', true, 'safe'],
    ['arm 1, narrow line', true, 'narrow'],
  ] as const)('%s survives 90 s on every seed', (_n, lanes, mode) => {
    const dead: number[] = [];
    for (let s = 1; s <= SEEDS; s++) if (!runBot(s, lanes, new Bot(mode), RUN_TICKS).alive) dead.push(s);
    expect(dead).toEqual([]);
  });

  it('first lantern is reached within 5 s on the safe line', () => {
    for (let s = 1; s <= SEEDS; s++) {
      const r = runBot(s, true, new Bot('safe'), RUN_TICKS);
      expect(r.firstLanternTick).toBeGreaterThan(0);
      expect(r.firstLanternTick).toBeLessThanOrEqual(5 * TICK_HZ);
    }
  });

  it('idle boat does not crash in the first 3 s', () => {
    for (let s = 1; s <= SEEDS; s++) {
      const sim = new Sim(s, true);
      while (sim.alive && sim.tick < 3 * TICK_HZ) sim.step(0);
      expect(sim.alive).toBe(true);
    }
  });
});

describe('forks (lane arm 1)', () => {
  it('arm 0 has no forks; arm 1 has forks and records a pick for each', () => {
    const a0 = new Sim(5, false), a1 = new Sim(5, true);
    const b0 = new Bot('safe'), b1 = new Bot('narrow');
    while (a0.tick < RUN_TICKS) a0.step(b0.input(a0));
    while (a1.tick < RUN_TICKS) a1.step(b1.input(a1));
    expect(a0.river.forks.length).toBe(0);
    expect(a1.river.forks.length).toBeGreaterThan(1);
    expect(a1.picks.length).toBeGreaterThan(1);
    expect(a1.picks.every((p) => p === 'narrow')).toBe(true);
  });

  it('the fork is visible at least 2 s before the split', () => {
    expect(VISION_BASE_TICKS).toBeGreaterThanOrEqual(2 * TICK_HZ);
    // and the view shows that far ahead even at top speed
    const aheadUnits = VIEW_H * BOAT_SCREEN_Y;
    expect(((SPEED_START + SPEED_RAMP) * VISION_BASE_TICKS) / TICK_HZ).toBeLessThanOrEqual(aheadUnits);
  });

  it('the wide lane is always wider than the narrow lane', () => {
    for (let s = 1; s <= 50; s++) {
      const sim = new Sim(s, true);
      const bot = new Bot('safe');
      while (sim.tick < RUN_TICKS) sim.step(bot.input(sim));
      const r = sim.river;
      for (const f of r.forks) {
        if (f.fullRow + 8 >= r.rows) continue; // fork not fully generated yet
        for (let i = f.fullRow; i < f.fullRow + 8; i++) {
          const wide = f.narrowLeft ? r.bankR[i] - r.islR[i] : r.islL[i] - r.bankL[i];
          const narrow = f.narrowLeft ? r.islL[i] - r.bankL[i] : r.bankR[i] - r.islR[i];
          expect(narrow).toBe(FORK_NARROW_W);
          expect(wide).toBeGreaterThan(narrow);
        }
      }
    }
  });

  it('rocks keep clear of the safe and narrow paths', () => {
    const sim = new Sim(77, true);
    const bot = new Bot('safe');
    while (sim.tick < RUN_TICKS) sim.step(bot.input(sim));
    const r = sim.river;
    for (const rk of r.rocks) {
      const row = Math.floor(rk.y / ROW);
      expect(Math.abs(rk.x - r.path[row])).toBeGreaterThan(rk.r);
      if (r.alt[row] >= 0) expect(Math.abs(rk.x - r.alt[row])).toBeGreaterThan(rk.r);
    }
    expect(FP).toBe(256);
  });
});

describe('input pulse', () => {
  it('a quick tap lasts at least the minimum pulse', () => {
    const p = new PulseState();
    p.press(0);
    p.release(0);
    let ticks = 0;
    while (p.sample() & 1) ticks++;
    expect(ticks).toBe(MIN_PULSE_TICKS);
  });

  it('holding keeps steering; both sides give both bits', () => {
    const p = new PulseState();
    p.press(1);
    for (let i = 0; i < 30; i++) expect(p.sample()).toBe(2);
    p.press(0);
    expect(p.sample()).toBe(3);
    p.release(0);
    p.release(1);
    for (let i = 0; i < MIN_PULSE_TICKS; i++) p.sample();
    expect(p.sample()).toBe(0);
  });
});
