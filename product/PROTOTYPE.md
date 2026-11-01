# Prototype plan: merged one-input river runner (base 007 Driftline)
- Author: PO-Tech
- Status: under-review (round 3 changes applied)
- Focus: tech & performance, realistic scope
- Inputs: decision 001, proposals 007 (base), 005 and 003 (merged layers), round 3 reviews and `product/reviews/round3-resolutions.md`
- Assumptions (user-confirmed): solo-fun core with social as a layer; opt-in rewarded ads plus cosmetics only; one-input arcade river runner.
- Team assumed: 1 developer, 0.5 artist. Effort in days for that team.
- Terms: "stretch" and "river map" (replaces "reach", "depth band", "Lodge map").

## 1. Goal and the question each stage answers
Goal: in about 6 calendar weeks, decide whether the one-input river core is fun enough to build the daily, shareable, persistent version on.

| Stage | Single question | Ships to |
|---|---|---|
| P0 Feel test | Is one more run the default, are deaths fair, and does the lane choice matter? | 20+ private testers (pooled) |
| P1 Daily seed + link ghost | Do players start a second run within 5 min, and does a challenge link pull new players in? | Public unlisted link, ~30 testers |
| P2 River map | Does the map lift D1 retention over the same build without it? | Holdout on a portal soft launch |
| P3 (not gated here) | Rewarded continue (opt-in, one per run) | Scoped after P2 |

Decision gate (decision 001): at least 40% of players start a second run within 5 minutes. P1 is the formal gate. P0 uses the same number as an internal check.

## 2. Stages

### P0 Feel test (9–11 days)
- **In:** one screen; portrait and landscape; procedural river from a random seed with the passable-lane guarantee; rocks, banks; lanterns (score, and a lantern reveals the next gap about 1 s further ahead); speed and narrowing ramp; restart under 1 s; best score in memory; 3 SFX; FPS overlay behind a flag.
- **Lane choice (required A/B arm):** `?lanes=0|1`, split evenly. Arm 0 is wide-only (control). Arm 1 has a narrow lantern lane and a safe wide lane. The fork is visible at least 2 s before the split. Gate applies to arm 1.
- **Out:** daily seed, ghosts, map, ads, accounts, menus, leaderboards, storage beyond a localStorage best score.
- **Playtesters do:** play on their own phone and laptop for 10 minutes with no instructions. We watch the first 30 s, count runs, then ask after the 3rd death: "one more?", "was that your fault?", and "did you take the risky line?" (arm 1).
- **Metrics:** time to first input; time to first lantern (target under 5 s on the safe line); first-run death at 20–40 s median (VISION's 30 s claim); restart latency p95; runs in 5 min; share of testers who start run 2 within 5 min; median session; self-rated fairness; FPS per R6; bot survival on 1,000 seeds.
- **Lane readouts:** narrow-pick rate (target 25–75%; under 10% or over 90% means dominated, retune); score and run length per arm; bot check: greedy-narrow vs safe-wide expected scores within about 20% on 1,000 seeds.
- **Go (pooled, at least 20 testers across both rounds):**
  - at least 40% of arm 1 start run 2 within 5 min;
  - median session at least 2 min;
  - at least 80% say their deaths were their own fault;
  - bot finds a passable lane on 100% of seeds;
  - FPS p5 at least 50 on 2019 Android (R6);
  - restart under 1 s at p95;
  - first lantern under 5 s on the safe line.
- **Sample-size caveat:** with 20 testers, one person moves the 40% gate by about 5 points. The result is directional until P1.
- **Iterate (one round):** 25–39% second run, median session 1.5–2 min, or 20–30% fairness complaints. Fix only the named cause (restart cost, ramp too steep, lane too narrow), then retest with 10–15 new testers and pool the results.
- **Kill:** still under 25% after the iteration round, or fairness complaints above 30%. Escalate to the group before P1.
- **Lane rule:** if arm 1's second-run rate is below arm 0's, cut the choice before P1 and keep the wide-only river.

### P1 Daily seed + link ghost (9–11 days)
- **In:**
  - date-derived daily seed (UTC); same course for everyone;
  - last run replayed as a translucent ghost on the same seed;
  - "copy challenge link" carrying `seedId`, `simVersion` and inputs only (never the score; the recipient's client recomputes it);
  - share code `seedId | simVersion | inputRuns`, with a version field; continue is encoded as an input event (P3), and a continue is not a new run;
  - first-party event logging (section 3).
- **Challenge arrival rules:**
  - always play the linked seed, even after the UTC day rolls over;
  - a past-date link plays once, then offers today's course;
  - a `simVersion` mismatch shows "this wake is from an older version", not a crash.
- **Out:** server, re-simulation, friend or top-wake ghosts and the 3-ghost "Sea" panel (they need a server), leaderboards, the wake card image (VISION bans generated images), river map, ads, accounts.
- **Playtesters do:** about 30 people from a link; play, retry, and open one challenge link sent by a second tester.
- **Metrics and go (directional at n of about 30):**
  - Organic second run within 5 min: the 40% gate.
  - Challenged-arrival second run: reported separately, outside the 40% gate (it will run higher).
  - Challenge open to played run: go 25% or more, iterate 15–24%, kill under 15% after one round.
  - Share rate (copy or native share invoked): 3–5% of sessions (kill under 1%); per finished run go 5% or more, iterate 2–4%.
  - Golden-hash match: 100% on Chrome, Firefox, Safari and Android Chrome.
  - Challenge opens per share (target 0.5 or more) is measured only in the soft launch, not in tester links.
- **Iterate:** organic second run 30–39%, or challenge conversion 15–24%. Change ghost visibility or the retry flow, then retest.
- **Kill (R7):** any cross-browser hash mismatch blocks ghosts after a 3-day fix window. Named owner: PO-Tech with the developer. If it is not fixed in 3 days, ship a score-only challenge and re-review. Separately, organic second run under 30% after one iteration kills P1 as a concept.

### P2 River map (8–11 days)
- **In:** every run lights a river-map stretch proportional to distance travelled, with a minimum of one stretch (R4); the map is drawn on canvas; versioned localStorage schema that never blocks play when wiped; "save your light" as a small, dismissible note after run 3; one cosmetic boat tint as a placeholder unlock.
- **Out:** lore text, friend glows, accounts or email capture, ads, skill unlocks, server, generated map or share images (R8).
- **Measurement:** holdout by anonymous install ID (hash mod 2). Arm A shows the map; arm B hides it. Same build, same seeds.
- **Metrics:** D1 return by arm; organic second-run rate; median session.
- **Math:** at a 30% D1 base, detecting a 5-point lift needs about 1,500 returning-eligible players per arm. A 30-person playtest cannot show this; playtests give direction only.
- **Go:** D1 lift of at least +5 pp with at least 1,500 per arm, and median session down no more than 10%.
- **Iterate:** lift of +2 to +5 pp. Adjust stretch pacing and retest.
- **Kill:** lift under +2 pp, or session length down more than 10%. Shelve the map; P1 ships without it.

## 3. Tech approach
- **Stack:** TypeScript (strict), HTML5 Canvas 2D, Vite for dev and build with code splitting. No framework, no physics library.
  - Why: about 200 sprite draws and simple collision fit Canvas 2D on a 2019 Android at 60 FPS.
  - Phaser or Pixi add several hundred KB gzipped before any game code, which breaks the 250 KB initial budget.
- **Deterministic sim (`src/sim`, no DOM imports):**
  - Fixed 60 Hz tick from an accumulator; rendering uses the latest state; cap 5 catch-up ticks; time is tick count, never `performance.now()` or the client clock.
  - Integer or fixed-point positions (for example, 1/256 px as int32). No float accumulation.
  - No `Math.sin`, `Math.cos`, `Math.exp` or `Math.pow` in the sim. Use integer lookup tables or integer math.
  - PRNG: mulberry32 with `Math.imul`, seeded from the daily seed.
  - Inputs recorded per tick and run-length encoded (only changes are stored). Target under 1 KB per 90 s run; measure it.
  - Golden test: FNV-1a state hash over ints every 60 ticks. Same recording must match on Chrome, Firefox, Safari and Android Chrome. CI runs Vitest (Node) and Playwright (3 browsers); one real 2019 Android is checked by hand (emulators misreport CPU).
- **Input (R1):**
  - Hold the left or right half of the screen to steer that way; release to drift straight.
  - A tap shorter than the sample gets a minimum pulse of about 6 ticks (100 ms), so casual taps are not lost.
  - Both sides held means straight ahead.
  - Pointer Events with pointer capture, so dragging off the half keeps the state; a second pointer is ignored.
  - `touch-action: none`; prevent context menu and double-tap zoom; handle `pointercancel`.
  - Desktop: mouse held on the left or right half; A/D and arrow keys. No Space. No third input in v1 (brake, boost); wind zones are a post-MVP option if P0 shows saturation.
  - Sample once per tick; the sim sees only left, right or none.
  - Keep the boat in the middle third of portrait so the thumb does not hide it.
  - `visibilitychange` pauses the sim; pause time is never recorded as ticks.
- **Audio:** WebAudio, unlocked on first pointerdown. Three short SFX (synthesized or Opus, under 100 KB), loaded after first input. Sound toggle in the corner, on after the first gesture. No ambient loop in P0–P2.
- **Storage:** localStorage with a schema version, inside try/catch (private mode, disabled storage). The game must run with storage wiped. No IndexedDB until P2 needs it.
- **Budgets (gzipped, measured in CI; build fails over budget):**

| Item | Budget | Check |
|---|---|---|
| Initial load (HTML, JS, CSS, first atlas) | 250 KB | size script in CI |
| Game code | 80 KB | size script |
| Audio (after first input) | 300 KB | size script |
| Total all assets | 1.5 MB | size script |
| Time to first frame, 4G throttled | under 2 s | Lighthouse-style run |
| FPS, 2019 Android Chrome, 4x CPU throttle (R6) | target p50 60, p5 50 or more; kill p5 under 45 | on-device, 60 s run |
| Frame CPU | under 8 ms | in-app timer |
| Memory after 10 min | under 150 MB, no growth | on-device |

- **Analytics:** first-party events, batched, sent with `navigator.sendBeacon` to a serverless endpoint from P1 on. P0 uses in-room observation plus a local log export.
  - `load` (ms); `first_input` (ms since load);
  - `run_start` (run_id, seed_id, attempt_no, arrival_type: organic | challenge);
  - `run_end` (run_id, score, duration_ms, cause, lanterns);
  - `second_run_start` (derived, within 5 min, with arrival_type);
  - `share_click` (copy or native share invoked);
  - `challenge_open` (seed_id, src); `challenge_played`;
  - `return_visit` (days since last); `replay_mismatch` (tick); `fps_summary` (p50, p5); `lane_pick` (arm, narrow or wide; P0 only).
  - Anonymous random install ID in localStorage. No PII. Disclosed in the footer.
- **Distribution:** static hosting (GitHub Pages or Cloudflare Pages) at an unlisted path with the build version in the URL. Recruitment tags through `?src=`. QR code for phone tests. No login.

## 4. Proposed repo layout (no code created)
```
game/
  index.html
  src/
    sim/        deterministic tick, river generator, forks, PRNG, fixed-point math (pure TS)
    render/     Canvas 2D drawing from sim state; never writes sim state
    input/      pointer and keyboard to per-tick input bit (R1 rules)
    audio/      WebAudio unlock, SFX
    meta/       localStorage, daily seed, share codes, challenge codec (P1), river map store (P2)
    analytics/  event queue and beacon
    main.ts     loop, wiring, ?lanes flag
  tests/
    sim/        Vitest: determinism, passable-lane check, fork visibility, seed snapshots
    golden/     Playwright: hash on 3 browsers; device checklist
  scripts/
    size-check.mjs    gzip budgets, fails CI
    bot-autopilot.ts  survival, greedy-narrow vs safe-wide check over 1,000 seeds
  public/             atlas, audio, favicon
```
Rule: `sim/` imports nothing from `render/`, `input/` or `audio/`.

## 5. Risks and mitigations
- **Unfair or unwinnable seeds:** passable-lane generator; bot check on 1,000 seeds before any playtest; fairness question in P0.
- **Lane choice dominated or absent (PO-Design):** A/B arm with readouts; cut before P1 if arm 1 underperforms.
- **One-input saturation:** no third input in v1; wind zones post-MVP.
- **Cross-browser float drift:** integer sim, golden tests on 4 targets, R7 3-day fix window, then ghosts drop.
- **Challenge URLs stripped or truncated (portals, link previews):** RLE inputs (target under 1 KB; if over 2 KB, compressed codec or short ID once a server exists). Before P1, test that the URL hash survives WhatsApp, iMessage, Discord and each portal iframe.
- **Mobile input bugs (scroll, zoom, cancel, iOS audio unlock):** real-device checklist before each playtest.
- **Ad fatigue and SDK weight (P3):** no ads in P0–P2. The continue SDK loads only at the death screen, one offer per run, never blocks first frame.
- **Scope creep:** each stage has in and out lists. Anything in "Out" needs a new stage decision.
- **Small samples:** P0 and P1 are directional at 20–30 testers; the map lift is measured in a soft launch at about 1,500 per arm.
- **Date and timezone:** seed uses the UTC date; short cache TTL for `index.html`; sim version in every share code.
- **Solo bus factor:** the golden test and size script keep the core safe for a second developer.

## Effort changes vs the first draft
- P0: 6–8 → 9–11 days. PO-Design estimated about 2 days for the lane arm. Confirmed for the flag, arm split and readouts. Corrected by about 1 more day for fork placement in the generator (2 s lead) and the greedy-narrow bot check.
- P1: 8–10 → 9–11 days (arrival rules, challenge codec, share metrics).
- P2: 8–12 → 8–11 days (map and holdout, no map image).
- Total about 26–33 days, roughly 6 calendar weeks for the team.

## Open questions
1. Hosting and serverless endpoint for beacons (Cloudflare or Netlify)? Who owns the cost (target under $10/month)?
2. Where do the ~30 P1 testers come from (existing audience, paid panel, portal beta)?
3. Consent for analytics in EU/UK: banner from P1, or anonymous with disclosure only?
4. Do we have a 2019-class Android in the lab? If not, buy or borrow before P1.
5. Portal target (CrazyGames, Poki, itch.io): their SDK, ad rules and portal-mandated breaks change the bundle and the P2 plan. Breaks only between runs, never mid-run, is a user decision.
6. Confirm the lane choice as a required P0 arm (this plan assumes yes, per round 3 resolutions).

— PO-Tech
