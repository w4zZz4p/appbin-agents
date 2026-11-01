/** Versioned localStorage. Every access is guarded: the game must run with storage wiped or blocked. */
const KEY = 'driftline.v1';
const SCHEMA = 1;

export interface Saved {
  schema: number;
  best: number;
  arm: 0 | 1 | null;
  installId: string;
  sound: boolean;
}

export function load(): Saved {
  const fresh: Saved = { schema: SCHEMA, best: 0, arm: null, installId: randomId(), sound: true };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh;
    const v = JSON.parse(raw) as Partial<Saved>;
    if (v.schema !== SCHEMA) return fresh;
    return { ...fresh, ...v };
  } catch {
    return fresh;
  }
}

export function save(s: Saved): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage unavailable */ }
}

export function randomId(): string {
  const a = new Uint32Array(2);
  try { crypto.getRandomValues(a); } catch { a[0] = (Math.random() * 2 ** 32) >>> 0; a[1] = Date.now() >>> 0; }
  return a[0].toString(36) + a[1].toString(36);
}

export function randomSeed(): number {
  const a = new Uint32Array(1);
  try { crypto.getRandomValues(a); } catch { a[0] = (Math.random() * 2 ** 32) >>> 0; }
  return a[0] >>> 0;
}
