import { Sim } from './sim.ts';
import { FP } from './tuning.ts';

/** Run-length encoded per-tick inputs: [input, count, input, count, ...]. */
export type Runs = number[];

export class Recorder {
  private runs: Runs = [];

  push(input: number): void {
    const n = this.runs.length;
    if (n > 0 && this.runs[n - 2] === input) this.runs[n - 1]++;
    else this.runs.push(input, 1);
  }

  get ticks(): number {
    let t = 0;
    for (let i = 1; i < this.runs.length; i += 2) t += this.runs[i];
    return t;
  }

  snapshot(): Runs {
    return this.runs.slice();
  }
}

export function expandRuns(runs: Runs): Uint8Array {
  let total = 0;
  for (let i = 1; i < runs.length; i += 2) total += runs[i];
  const out = new Uint8Array(total);
  let p = 0;
  for (let i = 0; i < runs.length; i += 2) out.fill(runs[i], p, (p += runs[i + 1]));
  return out;
}

/**
 * A recorded run re-simulated in lockstep with the player. Runs only end in a crash,
 * so the ghost must crash exactly on its last recorded tick; anything else is a
 * replay mismatch (different sim result on this browser or version).
 */
export class Ghost {
  readonly sim: Sim;
  readonly kind: 'last' | 'challenge';
  readonly trail: number[] = [];
  mismatch = false;
  private inputs: Uint8Array;

  constructor(seed: number, lanes: boolean, runs: Runs, kind: 'last' | 'challenge') {
    this.sim = new Sim(seed, lanes);
    this.inputs = expandRuns(runs);
    this.kind = kind;
  }

  get length(): number {
    return this.inputs.length;
  }

  /** Advance one tick. Returns true the moment a mismatch is first detected. */
  step(): boolean {
    const s = this.sim;
    if (!s.alive || this.mismatch) return false;
    if (s.tick >= this.inputs.length) {
      this.mismatch = true; // should have crashed by now
      return true;
    }
    s.step(this.inputs[s.tick]);
    if (s.tick % 6 === 0) this.trail.push(s.x / FP, s.y / FP);
    if (!s.alive && s.tick !== this.inputs.length) {
      this.mismatch = true; // crashed early
      return true;
    }
    return false;
  }
}

/** Fast-forward a recording without rendering (tests, score recompute). */
export function replay(seed: number, lanes: boolean, runs: Runs): Sim {
  const sim = new Sim(seed, lanes);
  const inputs = expandRuns(runs);
  for (let i = 0; i < inputs.length && sim.alive; i++) sim.step(inputs[i]);
  return sim;
}
