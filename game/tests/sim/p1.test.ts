import { describe, expect, it } from 'vitest';
import { Bot } from '../../src/sim/bot.ts';
import { Sim } from '../../src/sim/sim.ts';
import { Ghost, Recorder, replay } from '../../src/sim/replay.ts';
import { decodeChallenge, encodeChallenge } from '../../src/meta/share.ts';
import { seedForDay, utcDay } from '../../src/meta/daily.ts';
import { SIM_VERSION, TICK_HZ } from '../../src/sim/tuning.ts';

function recordRun(seed: number, lanes: boolean, bot: Bot, max = 90 * TICK_HZ) {
  const sim = new Sim(seed, lanes);
  const rec = new Recorder();
  while (sim.alive && sim.tick < max) {
    const inp = bot.input(sim);
    rec.push(inp);
    sim.step(inp);
  }
  return { sim, runs: rec.snapshot() };
}

describe('daily seed', () => {
  it('is the same for everyone on a UTC day and changes daily', () => {
    const d = utcDay(Date.UTC(2026, 10, 1, 23, 59));
    expect(utcDay(Date.UTC(2026, 10, 1, 0, 0))).toBe(d);
    expect(utcDay(Date.UTC(2026, 10, 2, 0, 0))).toBe(d + 1);
    expect(seedForDay(d)).toBe(seedForDay(d));
    expect(seedForDay(d)).not.toBe(seedForDay(d + 1));
  });
});

describe('replay and ghosts', () => {
  it('replaying recorded inputs reproduces the run exactly', () => {
    for (let s = 1; s <= 30; s++) {
      const { sim, runs } = recordRun(seedForDay(20000 + s), s % 2 === 0, new Bot('narrow', 25, s));
      const r = replay(seedForDay(20000 + s), s % 2 === 0, runs);
      expect([r.tick, r.score, r.alive, r.hash]).toEqual([sim.tick, sim.score, sim.alive, sim.hash]);
    }
  });

  it('a ghost crashes exactly on its last tick, with no mismatch', () => {
    const { sim, runs } = recordRun(99, true, new Bot('safe', 30, 4));
    expect(sim.alive).toBe(false);
    const g = new Ghost(99, true, runs, 'last');
    for (let i = 0; i < sim.tick + 50; i++) g.step();
    expect(g.mismatch).toBe(false);
    expect(g.sim.alive).toBe(false);
    expect(g.sim.score).toBe(sim.score);
  });

  it('a ghost on the wrong course reports a mismatch', () => {
    const { runs } = recordRun(99, true, new Bot('safe', 30, 4));
    const g = new Ghost(100, true, runs, 'challenge');
    let flagged = false;
    for (let i = 0; i < 6000 && !flagged; i++) flagged = g.step();
    expect(g.mismatch).toBe(true);
  });
});

describe('challenge code', () => {
  it('round-trips and never carries the score', () => {
    const { runs } = recordRun(seedForDay(20400), true, new Bot('narrow', 20, 9));
    const code = encodeChallenge({ simVersion: SIM_VERSION, day: 20400, lanes: true, runs });
    const c = decodeChallenge(code);
    expect(c).toEqual({ simVersion: SIM_VERSION, day: 20400, lanes: true, runs });
    expect(code).not.toContain('score');
  });

  it('stays under 1 KB for 90 s of human-paced input', () => {
    // people re-decide every ~100 ms at most (and taps last >= 6 ticks)
    let max = 0;
    for (let s = 1; s <= 40; s++) {
      for (const bot of [new Bot('safe', 20, s, 6), new Bot('narrow', 10, s, 6), new Bot('safe', 0, s, 6)]) {
        const { runs } = recordRun(seedForDay(20000 + s), true, bot);
        max = Math.max(max, encodeChallenge({ simVersion: SIM_VERSION, day: 20000 + s, lanes: true, runs }).length);
      }
    }
    expect(max).toBeLessThan(1024);
  });

  it('rejects malformed codes without throwing', () => {
    for (const bad of ['', 'x', '!!!!', 'AAAA', 'AQEB', '_'.repeat(50), encodeChallenge({ simVersion: 1, day: 1, lanes: false, runs: [0, 5] }).slice(0, -1) + '/']) {
      expect(decodeChallenge(bad)).toBeNull();
    }
  });
});
