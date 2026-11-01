import { Prng } from './prng.ts';
import {
  BOAT_HW, FIRST_LANTERN_Y, FORK_EXTRA_W, FORK_FIRST_Y, FORK_FULL_ROWS, FORK_GAP, FORK_GAP_RAND,
  FORK_ISLAND_W, FORK_NARROW_LANTERNS, FORK_NARROW_W, FORK_TAPER_ROWS, FORK_WIDE_LANTERNS,
  LANTERN_GAP, LANTERN_GAP_RAND, PATH_MARGIN, ROCK_CLEARANCE, ROCK_PM_BASE, ROCK_PM_DIV,
  ROCK_PM_MAX, ROW, SAFE_START, WORLD_W, riverWidth, speedUnits,
} from './tuning.ts';

export interface Rock { x: number; y: number; r: number }
/** lane: 0 = main river, 1 = narrow fork channel, 2 = wide fork channel */
export interface Lantern { id: number; x: number; y: number; lane: 0 | 1 | 2 }
export interface Fork { id: number; startRow: number; fullRow: number; endRow: number; narrowLeft: boolean }

interface Plan {
  begin: number; // first row of the approach zone
  a: number; p: number; t: number; f: number; q: number; // zone lengths in rows
  c: number; w: number;
  narrowLeft: boolean;
  p0: number; // path value when the pre zone starts
  altExit: number; // narrow path value when the fork ends
  fork: Fork;
}

const EDGE = 6; // banks never leave [EDGE, WORLD_W - EDGE]
const ROCK_LAG = 4;
const WIDE_MIN_EXTRA = 30; // wide lane is at least this much wider than the narrow lane // rocks are placed this many rows behind the newest row

/**
 * Procedural river, generated lazily row by row from a seed.
 * Guarantees a passable "safe path" (slope-limited so the boat can follow it)
 * that rocks keep clear of. In lane arm 1, forks add a narrow lantern channel.
 * All values are integers (units).
 */
export class River {
  readonly bankL: number[] = [];
  readonly bankR: number[] = [];
  readonly islL: number[] = []; // -1 when no island on this row
  readonly islR: number[] = [];
  readonly path: number[] = []; // safe path x
  readonly alt: number[] = []; // narrow-channel path x, -1 when none
  readonly rocks: Rock[] = []; // sorted by y
  readonly lanterns: Lantern[] = []; // sorted by y
  readonly forks: Fork[] = [];

  private rng: Prng;
  private c = WORLD_W / 2;
  private cTarget = WORLD_W / 2;
  private pTarget = WORLD_W / 2;
  private w = riverWidth(0);
  private nextLanternY = FIRST_LANTERN_Y;
  private nextForkY = FORK_FIRST_Y;
  private plan: Plan | null = null;

  readonly lanes: boolean;

  constructor(seed: number, lanes: boolean) {
    this.lanes = lanes;
    this.rng = new Prng(seed);
  }

  get rows(): number {
    return this.path.length;
  }

  /** Make sure rows [0, row] exist. */
  ensure(row: number): void {
    while (this.path.length <= row) this.genRow(this.path.length);
  }

  /** Path for a bot or test: 'narrow' uses the narrow channel where one exists. */
  pathAt(row: number, mode: 'safe' | 'narrow'): number {
    this.ensure(row);
    const a = this.alt[row];
    return mode === 'narrow' && a >= 0 ? a : this.path[row];
  }

  private genRow(i: number): void {
    const y = i * ROW;
    const s = speedUnits(y);
    const rng = this.rng;

    if (this.lanes && !this.plan && y >= this.nextForkY) this.startPlan(i, s);

    let bl: number, br: number, il = -1, ir = -1, p: number, alt = -1;
    const plan = this.plan;
    const prevP = i > 0 ? this.path[i - 1] : WORLD_W / 2;
    const maxStep = Math.max(2, Math.floor(480 / s)); // path slope limit (units per row)

    if (plan) {
      const k = i - plan.begin;
      const { a, t: T, f: F } = plan;
      const preEnd = a + plan.p;
      const fullStart = preEnd + T;
      const outStart = fullStart + F;
      const postStart = outStart + T;
      // taper factor as num/T
      let tn = 0;
      if (k >= preEnd && k < fullStart) tn = k - preEnd;
      else if (k >= fullStart && k < outStart) tn = T;
      else if (k >= outStart && k < postStart) tn = T - (k - outStart);
      const inIsland = k >= preEnd && k < postStart;
      const extra = Math.floor((FORK_EXTRA_W * tn) / T);
      bl = Math.max(EDGE, plan.c - (plan.w >> 1) - (extra >> 1));
      br = Math.min(WORLD_W - EDGE, plan.c + (plan.w >> 1) + (extra >> 1));

      if (k < a) {
        // approach: steer the path to the river centre
        p = stepToward(prevP, plan.c, maxStep);
      } else if (k < preEnd) {
        // pre zone: safe and narrow paths diverge from p0 to the two channel entries
        if (k === a) plan.p0 = prevP;
        const kp = k - a + 1;
        const ends = this.channelCentres(plan, bl, br, 0);
        p = plan.p0 + Math.trunc(((ends.wide - plan.p0) * kp) / plan.p);
        alt = plan.p0 + Math.trunc(((ends.narrow - plan.p0) * kp) / plan.p);
      } else if (inIsland) {
        // keep the wide lane at least WIDE_MIN_EXTRA wider than the narrow one
        const room = br - bl - FORK_NARROW_W - (FORK_NARROW_W + WIDE_MIN_EXTRA);
        const iw = Math.max(0, Math.min(Math.floor((FORK_ISLAND_W * tn) / T), room));
        if (plan.narrowLeft) { il = bl + FORK_NARROW_W; ir = il + iw; } else { ir = br - FORK_NARROW_W; il = ir - iw; }
        const cc = this.channelCentres(plan, bl, br, iw);
        p = cc.wide;
        alt = cc.narrow;
        plan.altExit = alt;
        const fl = k - fullStart;
        if (k >= fullStart && k < outStart) {
          for (let n = 1; n <= FORK_NARROW_LANTERNS; n++) {
            if (fl === Math.floor((F * n) / (FORK_NARROW_LANTERNS + 1))) this.addLantern(alt, y, 1);
          }
          for (let n = 1; n <= FORK_WIDE_LANTERNS; n++) {
            if (fl === Math.floor((F * n) / (FORK_WIDE_LANTERNS + 1))) this.addLantern(p, y, 2);
          }
        }
      } else {
        // post zone: narrow path converges back onto the safe path
        p = stepToward(prevP, plan.c, maxStep);
        const kq = k - postStart + 1;
        alt = plan.altExit + Math.trunc(((p - plan.altExit) * kq) / plan.q);
        if (kq >= plan.q) {
          alt = -1;
          this.plan = null;
          this.nextForkY = y + FORK_GAP + rng.int(FORK_GAP_RAND);
          this.nextLanternY = Math.max(this.nextLanternY, y + 200);
          this.cTarget = this.c;
          this.pTarget = p;
        }
      }
    } else {
      this.w = stepToward(this.w, riverWidth(y), 1);
      const half = this.w >> 1;
      if (y >= 600 && Math.abs(this.c - this.cTarget) < 1) {
        this.cTarget = half + 12 + rng.int(Math.max(1, WORLD_W - 2 * (half + 12)));
      }
      this.c = stepToward(this.c, this.cTarget, 1);
      bl = Math.max(EDGE, this.c - half);
      br = Math.min(WORLD_W - EDGE, this.c + half);
      const lo = bl + PATH_MARGIN, hi = br - PATH_MARGIN;
      if (y >= 600 && Math.abs(prevP - this.pTarget) <= 1) this.pTarget = lo + rng.int(Math.max(1, hi - lo));
      p = clamp(stepToward(prevP, clamp(this.pTarget, lo, hi), maxStep), lo, hi);
      if (y >= this.nextLanternY) {
        this.addLantern(p, y, 0);
        this.nextLanternY = y + LANTERN_GAP + rng.int(LANTERN_GAP_RAND);
      }
    }

    this.bankL.push(bl);
    this.bankR.push(br);
    this.islL.push(il);
    this.islR.push(ir);
    this.path.push(p);
    this.alt.push(alt);
    this.placeRock(i - ROCK_LAG);
  }

  private startPlan(i: number, s: number): void {
    const w = this.w;
    const zone = (secTenths: number) => Math.ceil((s * secTenths) / (10 * ROW));
    const t = FORK_TAPER_ROWS, f = FORK_FULL_ROWS;
    const a = zone(15), p = zone(18), q = zone(18);
    const fork: Fork = {
      id: this.forks.length,
      startRow: i + a + p,
      fullRow: i + a + p + t,
      endRow: i + a + p + t + f + t,
      narrowLeft: this.rng.int(2) === 0,
    };
    this.forks.push(fork);
    this.plan = { begin: i, a, p, t, f, q, c: this.c, w, narrowLeft: fork.narrowLeft, p0: this.c, altExit: this.c, fork };
  }

  private channelCentres(plan: Plan, bl: number, br: number, iw: number): { narrow: number; wide: number } {
    if (plan.narrowLeft) {
      const ir = bl + FORK_NARROW_W + iw;
      return { narrow: bl + (FORK_NARROW_W >> 1), wide: (ir + br) >> 1 };
    }
    const il = br - FORK_NARROW_W - iw;
    return { narrow: br - (FORK_NARROW_W >> 1), wide: (bl + il) >> 1 };
  }

  private addLantern(x: number, y: number, lane: 0 | 1 | 2): void {
    this.lanterns.push({ id: this.lanterns.length, x, y, lane });
  }

  private placeRock(j: number): void {
    if (j < 0) return;
    const y = j * ROW;
    if (y < SAFE_START) return;
    const rng = this.rng;
    const pm = Math.min(ROCK_PM_MAX, ROCK_PM_BASE + Math.floor(y / ROCK_PM_DIV));
    if (!rng.chance(pm, 1000)) return;
    const r = 9 + rng.int(8);
    const bl = this.bankL[j], br = this.bankR[j];
    const span = br - bl - 2 * r;
    if (span <= 0) return;
    const x = bl + r + rng.int(span);
    if (this.islL[j] >= 0 && x >= this.islL[j] && x <= this.islR[j]) return;
    const need = r + BOAT_HW + ROCK_CLEARANCE;
    const reach = Math.ceil((r + 16) / ROW);
    const last = this.path.length - 1;
    for (let k = Math.max(0, j - reach); k <= Math.min(last, j + reach); k++) {
      if (Math.abs(x - this.path[k]) < need) return;
      if (this.alt[k] >= 0 && Math.abs(x - this.alt[k]) < need) return;
    }
    this.rocks.push({ x, y, r });
  }
}

function stepToward(v: number, target: number, max: number): number {
  const d = target - v;
  if (d > max) return v + max;
  if (d < -max) return v - max;
  return target;
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
