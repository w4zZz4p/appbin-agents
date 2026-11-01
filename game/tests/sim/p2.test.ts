import { describe, expect, it } from 'vitest';
import { MAP_STRETCHES, TINT_UNLOCK_TOTAL, freshMap, lightRun, loadMap, mapArm, saveMap, stretchesFor } from '../../src/meta/map.ts';
import { STRETCH_LEN } from '../../src/sim/tuning.ts';

function memStore() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
}

describe('river map', () => {
  it('lights stretches in proportion to distance, minimum one (R4)', () => {
    expect(stretchesFor(0)).toBe(1);
    expect(stretchesFor(STRETCH_LEN - 1)).toBe(1);
    expect(stretchesFor(STRETCH_LEN * 3 + 10)).toBe(3);
    expect(lightRun(freshMap(), 50).added).toBe(1);
  });

  it('opens the next river when one is fully lit', () => {
    const s = { ...freshMap(), lit: MAP_STRETCHES - 2, total: 100 };
    const r = lightRun(s, STRETCH_LEN * 5);
    expect(r.completedRivers).toBe(1);
    expect(r.after.river).toBe(2);
    expect(r.after.lit).toBe(3);
    expect(r.after.total).toBe(105);
  });

  it('unlocks the tint once, at the threshold', () => {
    let s = freshMap();
    let unlocks = 0;
    for (let i = 0; i < 30; i++) {
      const r = lightRun(s, STRETCH_LEN);
      if (r.unlockedTint) {
        unlocks++;
        expect(r.after.total).toBe(TINT_UNLOCK_TOTAL);
      }
      s = r.after;
    }
    expect(unlocks).toBe(1);
    expect(s.tint).toBe(true);
  });

  it('survives wiped, corrupt, old-schema or blocked storage', () => {
    const st = memStore();
    expect(loadMap(st)).toEqual(freshMap());
    st.m.set('driftline.map.v1', '{not json');
    expect(loadMap(st)).toEqual(freshMap());
    st.m.set('driftline.map.v1', JSON.stringify({ schema: 0, lit: 5 }));
    expect(loadMap(st)).toEqual(freshMap());
    st.m.set('driftline.map.v1', JSON.stringify({ schema: 1, river: 1, lit: -3, total: 2, tint: false }));
    expect(loadMap(st)).toEqual(freshMap());
    const throwing = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    expect(loadMap(throwing)).toEqual(freshMap());
    expect(() => saveMap(freshMap(), throwing)).not.toThrow();
    expect(loadMap(null)).toEqual(freshMap());
  });

  it('round-trips through storage', () => {
    const st = memStore();
    const s = lightRun(freshMap(), STRETCH_LEN * 7).after;
    saveMap(s, st);
    expect(loadMap(st)).toEqual(s);
  });

  it('holdout arm is stable per install and roughly 50/50', () => {
    expect(mapArm('abc123')).toBe(mapArm('abc123'));
    let ones = 0;
    for (let i = 0; i < 2000; i++) ones += mapArm('id' + i.toString(36) + 'x' + (i * 7919).toString(36));
    expect(ones).toBeGreaterThan(900);
    expect(ones).toBeLessThan(1100);
  });
});
