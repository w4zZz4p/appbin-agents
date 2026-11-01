/** Daily course: everyone gets the same river on the same UTC date. */
const DAY_MS = 86_400_000;

export function utcDay(now = Date.now()): number {
  return Math.floor(now / DAY_MS);
}

/** Integer hash of the day number (deterministic in every engine). */
export function seedForDay(day: number): number {
  let h = (day ^ 0x5bd1e995) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

export function dayLabel(day: number): string {
  return new Date(day * DAY_MS).toISOString().slice(0, 10);
}
