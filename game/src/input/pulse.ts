import { IN_LEFT, IN_RIGHT } from '../sim/sim.ts';

export const MIN_PULSE_TICKS = 6; // ~100 ms, so a quick tap still nudges the boat

/** Pure per-side hold state with a minimum pulse; sampled once per sim tick. */
export class PulseState {
  private held = [false, false];
  private pulse = [0, 0];

  press(side: 0 | 1): void {
    if (!this.held[side]) this.pulse[side] = MIN_PULSE_TICKS;
    this.held[side] = true;
  }

  release(side: 0 | 1): void {
    this.held[side] = false;
  }

  clear(): void {
    this.held = [false, false];
    this.pulse = [0, 0];
  }

  isActive(side: 0 | 1): boolean {
    return this.held[side] || this.pulse[side] > 0;
  }

  /** Input bits for this tick (IN_LEFT | IN_RIGHT). */
  sample(): number {
    let bits = 0;
    if (this.isActive(0)) bits |= IN_LEFT;
    if (this.isActive(1)) bits |= IN_RIGHT;
    for (const s of [0, 1] as const) if (this.pulse[s] > 0) this.pulse[s]--;
    return bits;
  }
}
