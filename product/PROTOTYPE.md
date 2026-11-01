# Prototype plan: merged one-input river runner (base 007 Driftline)
- Author: PO-Tech
- Status: proposed
- Focus: tech & performance, realistic scope
- Inputs: decision 001, proposals 007 (base), 005 and 003 (merged layers), reviews in `product/reviews/`
- Assumptions (user-confirmed): solo-fun core with social as a layer; opt-in rewarded ads plus cosmetics only; one-input arcade river runner.
- Team assumed: 1 developer, 0.5 artist. Effort figures are in days for that team.

## 1. Goal and the question each stage answers
Goal: decide within about 5 weeks whether the one-input river core is fun enough to build a daily, shareable, persistent version on.

| Stage | Single question | Ships to |
|---|---|---|
| P0 Feel test | Does one more run after a death feel like the default, and is every death fair? | 10–15 private testers |
| P1 Daily seed + local ghost | Do players start a second run within 5 min, and does a shared run pull new players back? | Public unlisted link, ~30 testers |
| P2 Persistent lit map | Does the map lift D1 retention over the same build without it? | Holdout test on a portal soft launch |

Decision gate (from decision 001): at least 40% of players start a second run within 5 minutes. P1 is the formal gate; P0 uses the same number as an internal check.

## 2. Stages

### P0 Feel test (6–8 days)
- **In:** one screen; portrait and landscape; procedural river from a random seed with the passable-lane guarantee; rocks, banks, lanterns (score plus wider view); speed and narrowing ramp; restart under 1 s; best score in memory; 3 SFX; FPS overlay behind a flag.
- **Out:** daily seed, ghosts, map, ads, accounts, menus, leaderboards, storage beyond localStorage best score.
- **Optional, behind a flag:** the risk/reward choice (narrow channel with more lanterns vs wide safe channel) from PO-Design's review of 007. Not part of the gate; test it only if P0 is at 25–39%.
- **Playtesters do:** play on their own phone and laptop for 10 minutes with no instructions; we watch the first 30 s and count runs; after the 3rd death we ask "one more?" and "was that your fault?"
- **Metrics:** time to first input; time to first lantern (target under 5 s); runs in 5 min; share of testers who start run 2 within 5 min; median session length; self-rated fairness per death; autopilot bot survival on 1,000 seeds.
- **Go:** at least 40% start a second run within 5 min; median session at least 2 min; at least 80% say their deaths were their own fault; bot finds a passable lane on 100% of seeds.
- **Iterate (one round):** 25–39% second run, or median session 1.5–2 min. Fix only the named cause (restart cost, ramp too steep, lane too narrow), then retest with 10–15 new testers.
- **Kill:** still under 25% after the iteration round, or fairness complaints above 30%. Escalate to the group before P1.

### P1 Daily seed + local ghost (8–10 days)
- **In:** date-derived daily seed (UTC); daily course is the same for everyone; last run replayed as a translucent ghost on the same seed; "copy challenge link" that encodes the ghost path in the URL hash; share-code format (`seedId | simVersion | inputRuns`) with a version field; first-party event logging (section 3).
- **Out:** server, re-simulation, friend ghosts from a server, leaderboards, map, ads, accounts.
- **Playtesters do:** 30 people from a link; play, retry, and open one shared ghost link (we send them a challenge link from a second tester).
- **Metrics:** second run within 5 min (gate); challenge-link opens that lead to a played run (target 25%+); D1 return among returning testers (directional, n of about 20); golden-hash match rate across 4 target browsers (must be 100%).
- **Go:** second run at least 40%; challenge conversion at least 25%; golden hash 100% on Chrome, Firefox, Safari and Android Chrome.
- **Iterate:** second run 30–39% or challenge conversion 15–24%. Change ghost visibility or the retry flow, then retest.
- **Kill:** second run under 30% after one iteration. If only determinism fails and cannot be fixed in 3 days, drop ghosts and ship a score-only challenge, then re-review.

### P2 Persistent lit map (8–12 days)
- **In:** Lodge map (one lit "reach" per depth band reached, from 003, reached by run depth); versioned localStorage schema that never blocks play when wiped; "save your light" as a small, dismissible note after run 3; map image at death, rendered on canvas; one cosmetic boat tint as a placeholder unlock.
- **Out:** lore text, friend glows, accounts or email capture, ads, skill unlocks, server.
- **Measurement:** holdout. Split by anonymous install ID (hash mod 2): arm A has the map, arm B has it hidden. Same build, same seeds.
- **Metrics:** D1 return by arm; second-run rate; median session; map-image share rate.
- **Math:** at a 30% D1 base, detecting a 5-point lift needs about 1,500 returning-eligible players per arm. A 30-person playtest cannot show this. Playtests give a direction only; the lift is measured in a portal soft launch.
- **Go:** D1 lift of at least +5 pp with at least 1,500 per arm, and median session down no more than 10%.
- **Iterate:** lift of +2 to +5 pp. Adjust map reward pacing and retest.
- **Kill:** lift under +2 pp, or session length down more than 10%. Shelve the map. The core and P1 ship without it.

## 3. Tech approach
- **Stack:** TypeScript (strict), HTML5 Canvas 2D, Vite for dev and build with code splitting. No framework, no physics library.
  - Why: about 200 sprite draws and simple collision fit Canvas 2D on a 2019 Android at 60 FPS.
  - Phaser or Pixi add several hundred KB gzipped before any game code, which breaks the 250 KB initial budget.
  - WebGL is not needed for this sprite count.
- **Deterministic sim (`src/sim`, no DOM imports):**
  - Fixed 60 Hz tick from an accumulator; rendering uses the latest state; cap 5 catch-up ticks; time is tick count, never `performance.now()` or the client clock.
  - Integer or fixed-point positions (for example, 1/256 px as int32). No float accumulation.
  - No `Math.sin`, `Math.cos`, `Math.exp` or `Math.pow` in the sim. Use integer lookup tables or integer math.
  - PRNG: mulberry32 with `Math.imul`, seeded from the daily seed.
  - Inputs recorded per tick and run-length encoded (only changes are stored). Target under 1 KB per 90 s run; measure it.
  - Golden test: a state hash (FNV-1a over ints) every 60 ticks. Same recording must produce the same hash on Chrome, Firefox, Safari and Android Chrome. Run it in CI (Vitest for Node, Playwright for the 3 browsers) plus one real 2019 Android (emulators misreport CPU).
- **Input:**
  - Pointer Events with one active pointer; `touch-action: none`; prevent context menu and double-tap zoom; handle `pointercancel`.
  - Desktop: mouse button or Space; A/D and arrow keys; key repeat ignored.
  - Sample input once per tick; the sim only sees the sampled bit (left, right or none).
  - `visibilitychange` pauses the sim; pause time is never recorded as ticks.
- **Audio:** WebAudio. Unlock on first pointerdown. Three short SFX, synthesized or as Opus under 100 KB total. Loaded after the first input. Sound toggle in the corner, on by default after the first gesture.
- **Storage:** localStorage with a schema version, inside try/catch (private mode, disabled storage). The game must run with storage wiped. No IndexedDB until P2 needs it.
- **Budgets (gzipped, measured in CI, build fails over budget):**

| Item | Budget | Check |
|---|---|---|
| Initial load (HTML, JS, CSS, first atlas) | 250 KB | size script in CI |
| Game code | 80 KB | size script |
| Audio (loaded after first input) | 300 KB | size script |
| Total all assets | 1.5 MB | size script |
| Time to first frame on 4G throttled | under 2 s | Lighthouse-style run |
| FPS on 2019 Android Chrome, CPU 4x throttled | p50 60, p5 at least 50 over 60 s | on-device test |
| Frame CPU | under 8 ms | in-app timer |
| Memory after 10 min | under 150 MB, no growth | on-device test |

- **Analytics:** first-party events, batched, sent with `navigator.sendBeacon` to a serverless endpoint from P1 onward. P0 uses in-room observation plus a local log export.
  - Events: `load` (ms); `first_input` (ms since load); `run_start` (run_id, seed_id, attempt_no); `run_end` (run_id, score, duration_ms, cause, lanterns); `second_run_start` (derived, within 5 min); `share_click`; `challenge_open` (src); `challenge_played`; `return_visit` (days since last); `replay_mismatch` (tick); `fps_summary` (p50, p5); `map_shown` (arm, P2).
  - Anonymous random install ID in localStorage. No PII. Disclosed in the footer.
- **Distribution:** static hosting (GitHub Pages or Cloudflare Pages) at an unlisted path with the build version in the URL. Recruitment tags through `?src=`. QR code for phone tests. No login.

## 4. Proposed repo layout (no code created)
```
game/
  index.html
  src/
    sim/        deterministic tick, river generator, PRNG, fixed-point math (pure TS)
    render/     Canvas 2D drawing from sim state; never writes sim state
    input/      pointer and keyboard to per-tick input bit
    audio/      WebAudio unlock, SFX
    meta/       localStorage, daily seed, share codes, ghost codec (P1), map store (P2)
    analytics/  event queue and beacon
    main.ts     loop, wiring, flags
  tests/
    sim/        Vitest: determinism, passable-lane check, seed snapshots
    golden/     Playwright: hash on 3 browsers; device checklist
  scripts/
    size-check.mjs    gzip budgets, fails CI
    bot-autopilot.ts  survival check over 1,000 seeds
  public/             atlas, audio, favicon
```
Rule: `sim/` imports nothing from `render/`, `input/` or `audio/`. The golden tests depend on it.

## 5. Risks and mitigations
- **Unfair or unwinnable seeds:** passable-lane generator; bot autopilot check on 1,000 seeds before any playtest; fairness question in P0.
- **One-input saturation (PO-Design):** P0 choice flag; wind zones kept as a post-MVP modifier.
- **Cross-browser float drift:** integer sim, golden tests on 4 targets, kill path for ghosts (section 2, P1).
- **Long share URLs truncated by portals:** RLE inputs (target under 1 KB); if over 2 KB, switch to compressed codec or a short ID once a server exists.
- **Mobile input bugs (scroll, zoom, cancel, iOS audio unlock):** real-device checklist before each playtest.
- **Ad fatigue and SDK weight (later):** no ads in P0–P2; the rewarded-continue SDK loads only at the death screen; one offer per run; ad code must not block first frame.
- **Scope creep:** each stage has in and out lists. Anything in "Out" needs a new stage decision.
- **Small D1 sample:** playtests are directional only; the map lift is measured in a soft launch with about 1,500 per arm.
- **Date and timezone:** seed uses the UTC date; a stale cached build could show yesterday's course. Use short cache TTL for `index.html`, and put the sim version in every share code.
- **Solo bus factor:** the golden test and the size script keep the core safe for a second developer.

## Open questions
1. Which hosting and which serverless endpoint (Cloudflare or Netlify) do we use for beacons? Who owns the cost (target under $10/month)?
2. Where do the 30 P1 testers come from (existing audience, paid panel, portal beta)?
3. Consent for analytics in EU/UK. Do we need a banner from P1, or can we ship anonymous and disclose only?
4. Do we have a 2019-class Android device in the lab? If not, we need to buy or borrow one before P1.
5. Portal target (CrazyGames, Poki, itch.io): their SDK and ad rules change the bundle and the P2 measurement plan. Confirm before P2.
6. Is the choice variant (narrow vs safe channel) in P0 scope, or kept out until P0 lands in the 25–39% band?

— PO-Tech
