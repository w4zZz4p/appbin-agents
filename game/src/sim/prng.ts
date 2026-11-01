/** mulberry32: small, fast, deterministic across JS engines (integer ops only). */
export class Prng {
  private s: number;
  constructor(seed: number) {
    this.s = seed >>> 0;
  }
  /** Unsigned 32-bit integer. */
  next(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  }
  /** Integer in [0, n). */
  int(n: number): number {
    return n <= 0 ? 0 : this.next() % n;
  }
  /** True with probability num/den. */
  chance(num: number, den: number): boolean {
    return this.int(den) < num;
  }
}
