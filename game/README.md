# Driftline — P1 (daily river + link ghost)

Prototype stages from [`product/PROTOTYPE.md`](../product/PROTOTYPE.md).

- **P0 (feel test):** one procedural river, hold-a-side steering, lanterns, rocks, a speed
  and narrowing ramp, and the lane-choice A/B arm.
- **P1 (current build):**
  - A daily river from the UTC date, the same for everyone.
  - Your last run on that river races you as a white ghost wake.
  - "Challenge a friend" shares a link. The friend races your golden wake.
- **Not built yet:** the river map (P2), ads and the continue (P3), servers and leaderboards.

## P1: daily river, ghosts and challenges

- **Daily river:** the seed comes from the UTC date (`src/meta/daily.ts`). The best score
  and the last run are stored per day, so the ghost survives a reload the same day.
- **Ghosts** (`src/sim/replay.ts`): a recorded run is re-simulated in lockstep with the
  player from its inputs. A ghost must crash on exactly its last recorded tick. Anything
  else logs `replay_mismatch`.
- **Challenge link:** `…/?src=challenge#c=<code>`. The code (`src/meta/share.ts`) carries
  the format, `simVersion`, the UTC day, the lane arm and run-length-encoded inputs. It
  never carries the score; the recipient's game recomputes it. A 90 s run of human-paced
  input encodes to about 260 characters at most.
- **Arrival rules:**
  - A link always plays its own river, even after the UTC day rolls over.
  - A link from an earlier day plays once, then the crash panel says "Next: today's
    river".
  - A link from another `simVersion` shows "This wake is from an older version" and
    plays the river without the ghost.
  - A broken link shows a notice and plays today's river.
  - The link uses the sharer's lane arm for that river.
- **Sharing:** phones get the native share sheet. Desktop copies text and link to the
  clipboard, with a prompt as a last resort. No images.
- **`SIM_VERSION`** (`src/sim/tuning.ts`): bump it whenever simulation results change.
  The golden snapshot test fails until you do.

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
npm run golden     # same replays hash identically in Node + Chromium/Firefox/WebKit (R7)
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
| `?seed=<n>` | Fixed river seed instead of the daily one (debug; sharing is off). |
| `#c=<code>` | Challenge link (created by the game's share button). |

## Event log

Events are always kept on the device (localStorage) and can be exported from
`?debug=1` → **Export log**. If the site is built with `VITE_BEACON_URL` set, events are
also batched to that endpoint with `navigator.sendBeacon`, and a one-line disclosure
appears. No endpoint is configured yet (PROTOTYPE open question 1).

Events:

- **Session:** `load`, `first_input`, `return_visit` (days since last), `hidden`
- **Runs:**
  - `run_start` (run_id, seed_id = UTC day, lanes, attempt_no, course, ghosts)
  - `run_end` (score, duration, cause, lanterns, stretch, fork picks, beat_challenge)
  - `second_run_start` (`within_5min`)
  - `restart` (latency in ms)
- **Lane test:** `lane_pick`
- **Challenges:** `share_click` (method, code_len), `challenge_open` (valid, version_ok),
  `challenge_played`
- **Health:** `replay_mismatch`, `fps_summary`

Every event carries `arm`, `build`, `install` (random ID), `src` and `arrival_type`
(organic or challenge), so challenged arrivals can be reported apart from the 40% gate.

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

## P1 status

| P1 item | Status |
|---|---|
| Daily seed (UTC), same course for everyone | ✅ unit-tested |
| Last run as a ghost on the same seed | ✅ in-game, survives a same-day reload |
| Challenge link with seedId, simVersion, inputs only (no score) | ✅ round-trip and malformed-code tests |
| Arrival rules (linked seed, past-date plays once, version notice) | ✅ checked in Chromium |
| Share flow (native share or clipboard), no images | ✅ clipboard checked in Chromium; native sheet needs a phone |
| P1 events (share_click, challenge_open/played, arrival_type, return_visit, replay_mismatch) | ✅ |
| Golden-hash match on Chrome, Firefox, Safari (WebKit) and Node | ✅ Chromium locally; all three run in CI (`golden` job) |
| Golden hash on real Android Chrome | ⏳ manual device check |
| Link survives WhatsApp, iMessage, Discord and portal iframes | ⏳ manual check before P1 testers |
| Sending events to a server | ⏳ needs an endpoint (open question 1) |
| 40% organic second run; ≥ 25% of challenge opens played; 3–5% share rate | ⏳ needs ~30 testers |

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
