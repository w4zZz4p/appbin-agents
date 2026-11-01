// All gameplay numbers live here. Units: 1 "unit" = 1/360 of the river world width.
// The sim stores positions in fixed point (FP sub-units per unit) as plain integers,
// so every browser computes exactly the same result.

export const FP = 256;
export const TICK_HZ = 60;
export const ROW = 8; // river is generated in rows of ROW units
export const WORLD_W = 360;
export const VIEW_H = 640; // logical view height (units) the camera always fits
export const BOAT_SCREEN_Y = 0.66; // boat sits at the bottom of the middle third

export const BOAT_HW = 8; // half width (units)
export const BOAT_HL = 13; // half length (units)

// Forward speed in units/s ramps with distance travelled.
export const SPEED_START = 105;
export const SPEED_RAMP = 45; // added over the ramp
export const SPEED_RAMP_DIV = 150; // +1 unit/s per 150 units travelled

// River width narrows with distance.
export const WIDTH_START = 300;
export const WIDTH_MIN = 130;
export const WIDTH_DIV = 40; // -1 unit of width per 40 units travelled

// Lateral control (FP per tick).
export const VX_MAX = Math.floor((150 * FP) / TICK_HZ); // 150 units/s
export const ACCEL = Math.round((600 * FP) / (TICK_HZ * TICK_HZ)); // 600 units/s^2
export const DRIFT_DAMP_PCT = 3; // per tick, when no side is held
export const STRAIGHT_DAMP_PCT = 15; // per tick, when both sides are held

// Vision: how far ahead the river is revealed, in ticks of travel.
export const VISION_BASE_TICKS = 126; // 2.1 s, so forks are visible >= 2 s ahead
export const LANTERN_VISION_TICKS = 60; // a lantern reveals ~1 s further ahead
export const LANTERN_BONUS_TICKS = 360; // for 6 s

export const LANTERN_PICK = 16; // pickup half-size (units)
export const LANTERN_POINTS = 15;
export const DISTANCE_PER_POINT = 10;
export const STRETCH_LEN = 1000; // units per map stretch

// Generator.
export const SAFE_START = 450; // no rocks before this distance
export const FIRST_LANTERN_Y = 280; // ~2.7 s at start speed (< 5 s gate)
export const LANTERN_GAP = 380;
export const LANTERN_GAP_RAND = 160;
export const PATH_MARGIN = BOAT_HW + 18;
export const ROCK_CLEARANCE = 12; // extra space kept around the safe path
// Rock chance per row, in per-mille (integers keep the sim deterministic).
export const ROCK_PM_BASE = 100;
export const ROCK_PM_DIV = 20; // +1 per-mille per 20 units travelled
export const ROCK_PM_MAX = 300;

// Forks (lane arm 1).
export const FORK_FIRST_Y = 1400;
export const FORK_GAP = 1500;
export const FORK_GAP_RAND = 800;
export const FORK_NARROW_W = 72; // narrow channel width (boat is 16 wide)
export const FORK_ISLAND_W = 60;
export const FORK_EXTRA_W = 100; // river widens by this at a fork, so the wide lane stays wide
export const FORK_TAPER_ROWS = 16;
export const FORK_FULL_ROWS = 24;
export const FORK_NARROW_LANTERNS = 6;
export const FORK_WIDE_LANTERNS = 1;

export function speedFPs(yFP: number): number {
  return SPEED_START * FP + Math.min(SPEED_RAMP * FP, Math.floor(yFP / SPEED_RAMP_DIV));
}

/** Forward movement per tick, in FP. */
export function speedTick(yFP: number): number {
  return Math.floor(speedFPs(yFP) / TICK_HZ);
}

/** Speed in units/s at a distance in units (used by the generator). */
export function speedUnits(y: number): number {
  return SPEED_START + Math.min(SPEED_RAMP, Math.floor(y / SPEED_RAMP_DIV));
}

export function riverWidth(y: number): number {
  return Math.max(WIDTH_MIN, WIDTH_START - Math.floor(y / WIDTH_DIV));
}

/** Bump whenever a change alters simulation results (river, physics, scoring).
 *  Share codes and ghosts carry it; a mismatch shows a notice instead of a wrong replay. */
export const SIM_VERSION = 1;
