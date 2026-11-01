/**
 * P2 river map: progress that carries over between sessions.
 * Every finished run lights map stretches in proportion to the distance travelled,
 * with a minimum of one (R4). A river has MAP_STRETCHES stretches; when it is fully
 * lit, the next river opens. Pure logic + a guarded, versioned localStorage store:
 * a wiped or blocked store just starts a fresh map and never blocks play.
 * Nothing here feeds back into the simulation.
 */
import { STRETCH_LEN } from '../sim/tuning.ts';

export const MAP_STRETCHES = 40;
export const TINT_UNLOCK_TOTAL = 15; // placeholder cosmetic unlock

const KEY = 'driftline.map.v1';
const SCHEMA = 1;

export interface MapState {
  schema: number;
  river: number; // 1-based river number
  lit: number; // stretches lit on the current river (0..MAP_STRETCHES)
  total: number; // stretches lit across all rivers
  tint: boolean; // cosmetic boat tint unlocked
}

export interface LightResult {
  added: number;
  before: MapState;
  after: MapState;
  completedRivers: number;
  unlockedTint: boolean;
}

export function freshMap(): MapState {
  return { schema: SCHEMA, river: 1, lit: 0, total: 0, tint: false };
}

/** Stretches a run lights: proportional to distance, minimum one. */
export function stretchesFor(distanceUnits: number): number {
  return Math.max(1, Math.floor(distanceUnits / STRETCH_LEN));
}

export function lightRun(state: MapState, distanceUnits: number): LightResult {
  const before = { ...state };
  const added = stretchesFor(distanceUnits);
  const after = { ...state, total: state.total + added };
  let lit = state.lit + added;
  let completedRivers = 0;
  while (lit >= MAP_STRETCHES) {
    lit -= MAP_STRETCHES;
    after.river++;
    completedRivers++;
  }
  after.lit = lit;
  const unlockedTint = !state.tint && after.total >= TINT_UNLOCK_TOTAL;
  if (unlockedTint) after.tint = true;
  return { added, before, after, completedRivers, unlockedTint };
}

export function loadMap(storage: Pick<Storage, 'getItem'> | null = safeStorage()): MapState {
  try {
    const raw = storage?.getItem(KEY);
    if (!raw) return freshMap();
    const v = JSON.parse(raw) as Partial<MapState>;
    if (v.schema !== SCHEMA) return freshMap();
    const m = { ...freshMap(), ...v };
    const ok = [m.river, m.lit, m.total].every((n) => Number.isInteger(n) && n >= 0) && m.river >= 1 && m.lit < MAP_STRETCHES;
    return ok ? m : freshMap();
  } catch {
    return freshMap();
  }
}

export function saveMap(m: MapState, storage: Pick<Storage, 'setItem'> | null = safeStorage()): void {
  try { storage?.setItem(KEY, JSON.stringify(m)); } catch { /* storage unavailable */ }
}

function safeStorage(): Storage | null {
  try { return typeof localStorage === 'undefined' ? null : localStorage; } catch { return null; }
}

/** Holdout arm from the anonymous install ID (FNV-1a hash mod 2): 1 = map shown, 0 = hidden. */
export function mapArm(installId: string): 0 | 1 {
  let h = 0x811c9dc5;
  for (let i = 0; i < installId.length; i++) {
    h ^= installId.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  // finalize (murmur3 fmix) so every input bit affects the arm bit
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return ((h ^ (h >>> 16)) >>> 31) as 0 | 1;
}
