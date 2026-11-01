import type { Runs } from '../sim/replay.ts';

/**
 * Challenge share code: seedId (UTC day), simVersion, lane arm and the run's inputs.
 * Never the score: the recipient's client recomputes it by replaying the inputs.
 * Layout (varints, then base64url):
 *   format | simVersion | day | lanes | runCount | (count << 2 | input) ...
 */
const FORMAT = 1;

export interface Challenge {
  simVersion: number;
  day: number;
  lanes: boolean;
  runs: Runs;
}

export function encodeChallenge(c: Challenge): string {
  const bytes: number[] = [];
  const v = (n: number) => {
    let x = n >>> 0;
    while (x >= 0x80) { bytes.push((x & 0x7f) | 0x80); x >>>= 7; }
    bytes.push(x);
  };
  v(FORMAT);
  v(c.simVersion);
  v(c.day);
  v(c.lanes ? 1 : 0);
  v(c.runs.length / 2);
  for (let i = 0; i < c.runs.length; i += 2) v((c.runs[i + 1] << 2) | (c.runs[i] & 3));
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Returns null for anything malformed (a bad link must never crash the game). */
export function decodeChallenge(code: string): Challenge | null {
  try {
    if (!/^[A-Za-z0-9_-]{4,20000}$/.test(code)) return null;
    const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
    let p = 0;
    const v = (): number => {
      let x = 0, shift = 0;
      for (;;) {
        if (p >= bin.length || shift > 28) throw new Error('truncated');
        const b = bin.charCodeAt(p++);
        x |= (b & 0x7f) << shift;
        if (b < 0x80) return x >>> 0;
        shift += 7;
      }
    };
    if (v() !== FORMAT) return null;
    const simVersion = v(), day = v(), lanes = v() === 1, n = v();
    if (n < 1 || n > 100000) return null;
    const runs: Runs = [];
    let ticks = 0;
    for (let i = 0; i < n; i++) {
      const x = v();
      const count = x >>> 2;
      if (count < 1) return null;
      ticks += count;
      runs.push(x & 3, count);
    }
    if (p !== bin.length || ticks > 60 * 60 * 30) return null;
    return { simVersion, day, lanes, runs };
  } catch {
    return null;
  }
}
