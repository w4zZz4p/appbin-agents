import { Prng } from './prng.ts';
import { IN_LEFT, IN_RIGHT, Sim } from './sim.ts';
import { ACCEL, FP, ROW, VX_MAX, speedTick } from './tuning.ts';

export type BotMode = 'safe' | 'narrow';

/**
 * Autopilot that follows the generator's safe path (or the narrow fork channel).
 * A perfect bot proves every seed is passable with the real controls.
 * With `skill` < 1 it adds steering error, for expected-score comparisons.
 */
export class Bot {
  private rng: Prng;
  private jitter = 0;
  private held = 0;
  private holdLeft = 0;

  readonly mode: BotMode;
  readonly errorUnits: number;

  constructor(mode: BotMode, errorUnits = 0, seed = 1) {
    this.mode = mode;
    this.errorUnits = errorUnits;
    this.rng = new Prng(seed ^ 0x9e3779b9);
  }

  input(sim: Sim): number {
    const lookTicks = 14;
    const lookY = sim.y + speedTick(sim.y) * lookTicks;
    const row = Math.floor(lookY / (ROW * FP));
    let target = sim.river.pathAt(row, this.mode) * FP;
    if (this.errorUnits > 0) {
      // slow random walk of aiming error, plus occasional late reactions
      this.jitter += (this.rng.int(2 * 4 + 1) - 4) * FP;
      const lim = this.errorUnits * FP;
      if (this.jitter > lim) this.jitter = lim;
      if (this.jitter < -lim) this.jitter = -lim;
      target += this.jitter;
      if (this.holdLeft > 0) { this.holdLeft--; return this.held; }
      if (this.rng.int(100) < 3) this.holdLeft = 4 + this.rng.int(8);
    }
    const err = target - sim.x;
    let want = Math.trunc(err / 10);
    if (want > VX_MAX) want = VX_MAX;
    if (want < -VX_MAX) want = -VX_MAX;
    let inp = 0;
    if (want > sim.vx + (ACCEL >> 1)) inp = IN_RIGHT;
    else if (want < sim.vx - (ACCEL >> 1)) inp = IN_LEFT;
    this.held = inp;
    return inp;
  }
}

export interface RunResult { seed: number; alive: boolean; ticks: number; score: number; lanterns: number; picks: string[]; firstLanternTick: number }

export function runBot(seed: number, lanes: boolean, bot: Bot, maxTicks: number): RunResult {
  const sim = new Sim(seed, lanes);
  let firstLanternTick = -1;
  while (sim.alive && sim.tick < maxTicks) {
    const ev = sim.step(bot.input(sim));
    if (firstLanternTick < 0 && ev.some((e) => e.type === 'lantern')) firstLanternTick = sim.tick;
  }
  return { seed, alive: sim.alive, ticks: sim.tick, score: sim.score, lanterns: sim.lanterns, picks: sim.picks, firstLanternTick };
}
