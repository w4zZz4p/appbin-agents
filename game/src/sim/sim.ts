import { River } from './river.ts';
import {
  ACCEL, BOAT_HL, BOAT_HW, DISTANCE_PER_POINT, DRIFT_DAMP_PCT, FP, LANTERN_BONUS_TICKS,
  LANTERN_PICK, LANTERN_POINTS, LANTERN_VISION_TICKS, ROW, STRAIGHT_DAMP_PCT, STRETCH_LEN,
  TICK_HZ, VISION_BASE_TICKS, VX_MAX, WORLD_W, speedTick,
} from './tuning.ts';

/** Per-tick input bits. */
export const IN_LEFT = 1;
export const IN_RIGHT = 2;

export type SimEvent =
  | { type: 'lantern'; id: number; lane: 0 | 1 | 2 }
  | { type: 'crash'; cause: 'bank' | 'island' | 'rock' }
  | { type: 'lane_pick'; fork: number; pick: 'narrow' | 'wide' };

const ROW_FP = ROW * FP;
const GEN_AHEAD_ROWS = 120; // generate ~960 units ahead of the boat

/**
 * Deterministic river-run simulation. Integer state only; advance with step().
 * Time is the tick count; nothing here reads clocks, the DOM or Math.random.
 */
export class Sim {
  readonly river: River;
  tick = 0;
  x = (WORLD_W / 2) * FP;
  y = 0;
  vx = 0;
  alive = true;
  cause: 'bank' | 'island' | 'rock' | null = null;
  lanterns = 0;
  bonus = 0; // lantern vision ticks remaining
  hash = 0x811c9dc5;
  readonly collected = new Set<number>();
  readonly picks: ('narrow' | 'wide')[] = [];
  private rockIdx = 0;
  private lanternIdx = 0;
  private forkIdx = 0;

  readonly seed: number;
  readonly lanes: boolean;

  constructor(seed: number, lanes: boolean) {
    this.seed = seed;
    this.lanes = lanes;
    this.river = new River(seed, lanes);
    this.river.ensure(GEN_AHEAD_ROWS);
  }

  get yUnits(): number {
    return Math.floor(this.y / FP);
  }

  get score(): number {
    return Math.floor(this.yUnits / DISTANCE_PER_POINT) + this.lanterns * LANTERN_POINTS;
  }

  /** 1-based stretch number of the river map the boat has reached. */
  get stretch(): number {
    return Math.floor(this.yUnits / STRETCH_LEN) + 1;
  }

  /** How far ahead the river is revealed, in units. */
  get vision(): number {
    const ticks = VISION_BASE_TICKS + (this.bonus > 0 ? LANTERN_VISION_TICKS : 0);
    return Math.floor((speedTick(this.y) * ticks) / FP);
  }

  get seconds(): number {
    return this.tick / TICK_HZ;
  }

  step(input: number): SimEvent[] {
    const ev: SimEvent[] = [];
    if (!this.alive) return ev;
    const left = (input & IN_LEFT) !== 0;
    const right = (input & IN_RIGHT) !== 0;
    if (left && right) this.vx -= Math.trunc((this.vx * STRAIGHT_DAMP_PCT) / 100);
    else if (left) this.vx = Math.max(-VX_MAX, this.vx - ACCEL);
    else if (right) this.vx = Math.min(VX_MAX, this.vx + ACCEL);
    else this.vx -= Math.trunc((this.vx * DRIFT_DAMP_PCT) / 100);

    this.x += this.vx;
    this.y += speedTick(this.y);
    if (this.bonus > 0) this.bonus--;
    this.tick++;
    this.river.ensure(Math.floor(this.y / ROW_FP) + GEN_AHEAD_ROWS);

    this.checkForks(ev);
    this.checkLanterns(ev);
    const cause = this.checkCrash();
    if (cause) {
      this.alive = false;
      this.cause = cause;
      ev.push({ type: 'crash', cause });
    }
    if (this.tick % 60 === 0 || !this.alive) this.mixHash();
    return ev;
  }

  private mixHash(): void {
    for (const v of [this.tick, this.x, this.y, this.vx, this.lanterns, this.alive ? 1 : 0]) {
      let n = v | 0;
      for (let b = 0; b < 4; b++) {
        this.hash ^= n & 0xff;
        this.hash = Math.imul(this.hash, 0x01000193) >>> 0;
        n >>>= 8;
      }
    }
  }

  private checkForks(ev: SimEvent[]): void {
    const forks = this.river.forks;
    while (this.forkIdx < forks.length && this.y >= forks[this.forkIdx].fullRow * ROW_FP) {
      const f = forks[this.forkIdx];
      const r = f.fullRow;
      const bx = this.x;
      const pick = f.narrowLeft ? (bx < this.river.islL[r] * FP ? 'narrow' : 'wide') : bx > this.river.islR[r] * FP ? 'narrow' : 'wide';
      this.picks.push(pick);
      ev.push({ type: 'lane_pick', fork: f.id, pick });
      this.forkIdx++;
    }
  }

  private checkLanterns(ev: SimEvent[]): void {
    const ls = this.river.lanterns;
    const pick = LANTERN_PICK * FP;
    while (this.lanternIdx < ls.length && ls[this.lanternIdx].y * FP < this.y - pick) this.lanternIdx++;
    for (let i = this.lanternIdx; i < ls.length && ls[i].y * FP <= this.y + pick; i++) {
      const l = ls[i];
      if (this.collected.has(l.id)) continue;
      if (Math.abs(l.x * FP - this.x) <= pick) {
        this.collected.add(l.id);
        this.lanterns++;
        this.bonus = LANTERN_BONUS_TICKS;
        ev.push({ type: 'lantern', id: l.id, lane: l.lane });
      }
    }
  }

  private checkCrash(): 'bank' | 'island' | 'rock' | null {
    const { x, y } = this;
    const hw = BOAT_HW * FP, hl = BOAT_HL * FP, sw = Math.floor((BOAT_HW * FP * 6) / 10);
    const pts: [number, number][] = [
      [x, y + hl],
      [x - hw, y],
      [x + hw, y],
      [x - sw, y - hl],
      [x + sw, y - hl],
    ];
    const rv = this.river;
    for (const [px, py] of pts) {
      const row = Math.max(0, Math.floor(py / ROW_FP));
      if (px < rv.bankL[row] * FP || px > rv.bankR[row] * FP) return 'bank';
      if (rv.islL[row] >= 0 && px > rv.islL[row] * FP && px < rv.islR[row] * FP) return 'island';
    }
    const rocks = rv.rocks;
    const reach = 32 * FP;
    while (this.rockIdx < rocks.length && rocks[this.rockIdx].y * FP < y - reach) this.rockIdx++;
    for (let i = this.rockIdx; i < rocks.length && rocks[i].y * FP <= y + reach; i++) {
      const r = rocks[i];
      const rx = r.x * FP, ry = r.y * FP, rr = r.r * FP;
      const dx = rx - x, dy = ry - y;
      const body = rr + hw - 2 * FP;
      if (dx * dx + dy * dy < body * body) return 'rock';
      for (const [px, py] of pts) {
        const ex = rx - px, ey = ry - py;
        if (ex * ex + ey * ey < rr * rr) return 'rock';
      }
    }
    return null;
  }
}
