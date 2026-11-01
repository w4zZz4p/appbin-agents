# Driftline — P0 feel test

Prototype stage P0 from [`product/PROTOTYPE.md`](../product/PROTOTYPE.md): one procedural
river, hold-a-side steering, lanterns, rocks, a speed and narrowing ramp, and the
lane-choice A/B arm. No daily seed, ghosts, map, ads or menus (those are P1/P2).

## Run it

```sh
cd game
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/ (host anywhere, e.g. GitHub Pages)
```

### Hosting (GitHub Pages)

`.github/workflows/pages.yml` tests, builds and publishes `game/dist` on every push that
touches `game/`, and can also be run by hand (Actions → deploy-pages → Run workflow).
One-time setup: in the repository's **Settings → Pages**, set **Source** to **GitHub Actions**.
The site is served at `https://<owner>.github.io/<repo>/`. Share playtest links with
flags, e.g. `.../?src=friends1`. Note: Pages for a private repository requires a paid
GitHub plan, and the published site is public unless the org uses private Pages.

Checks (also run in CI, `.github/workflows/game-ci.yml`):

```sh
npm test           # determinism, golden hash, passable lanes, forks, input pulse
npm run bot        # 1,000-seed bot check + lane balance readout
npm run build && npm run size   # gzip budgets (fails when over)
```

## Controls (R1)

- Hold the left or right half of the screen to steer that way; release to drift.
- Both sides held steers straight. A quick tap still nudges the boat for ~100 ms.
- Desktop: hold the mouse on a half, or A/D or the arrow keys.
- After a crash, tap or press a steering key to drift again.

## URL flags for playtests

| Flag | Effect |
|---|---|
| `?lanes=0` / `?lanes=1` | Force the lane arm. Without it, each device gets a stable 50/50 split. Arm 0 = wide-only control, arm 1 = forks with a narrow lantern lane. |
| `?src=<tag>` | Recruitment tag, stored on every logged event. |
| `?fps=1` | FPS overlay (p50, p5, frame CPU). |
| `?debug=1` | Debug panel: arm, seed, run count, **Export log** (JSON), Clear log, switch arm. Also turns on the FPS overlay. |
| `?seed=<n>` | Fixed river seed (to reproduce a run). |

## Event log (P0 analytics)

P0 has no network. Events are kept on the device (localStorage) and exported from
`?debug=1` → **Export log**. Events: `load`, `first_input`, `run_start`, `run_end`
(score, duration, cause, lanterns, stretch, fork picks), `second_run_start` (with
`within_5min`), `lane_pick`, `restart` (latency in ms), `fps_summary`, `hidden`.
Every event carries `arm`, `build`, `install` (random ID) and `src`.

## How it's built

- TypeScript + Canvas 2D + Vite, no framework. About 9 KB gzipped in total.
- `src/sim/` is a deterministic integer simulation at a fixed 60 Hz. It uses the mulberry32
  PRNG and no trig or clock in the sim, so the same seed and inputs replay identically
  (needed for P1 ghosts). It imports nothing from render, input or audio.
- `src/sim/river.ts` generates the river row by row. It keeps a slope-limited safe path
  that rocks stay clear of, and in arm 1 adds forks. Each fork is visible at least 2 s
  ahead, with a 72-unit narrow channel holding 6 lanterns next to a wider safe channel
  holding 1.
- All tuning numbers are in `src/sim/tuning.ts`.

## P0 gate status

| Go criterion | Status |
|---|---|
| Bot finds a passable lane on 100% of seeds | ✅ 1,000/1,000 seeds, both arms, both lines |
| First lantern under 5 s on the safe line | ✅ 2.5 s on every seed |
| Restart under 1 s (p95) | ✅ 4–12 ms in desktop Chromium; confirm on device |
| Lane balance: greedy-narrow vs safe-wide within ~20% | ✅ ratio 0.80–0.95 across three bot skill levels |
| Fork visible ≥ 2 s before the split | ✅ base vision 2.1 s (unit-tested) |
| FPS p5 ≥ 50 on a 2019 Android | ⏳ needs the device (open question 4) |
| ≥ 40% of arm 1 start run 2 within 5 min | ⏳ needs 20+ playtesters |
| Median session ≥ 2 min; ≥ 80% say deaths were their fault | ⏳ needs playtesters |
