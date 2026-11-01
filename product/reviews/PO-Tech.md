# PO-Tech: Round 2 review, shared RICE, vote
- Author: PO-Tech
- Date: 2026-11-01
- Assumptions: solo-fun core with social as a layer; ads only rewarded/opt-in plus cosmetics; genre (action vs puzzle) open.
- Effort = total person-months (all roles) to a public MVP for a small team.

## 1. Reviews

### 001 Plume: support (with concerns)
- Tech is cheap: Canvas 2D, localStorage, under 1 MB. Ghost replay is free if the sim is fixed-step.
- Hold detection should sample pointer events on the fixed tick, not wait for rAF.
- Daily Wind leaderboard: ship local ranking first, as the author already suggests.
- Improvement: make the wind map a seeded fixed-step function, so Daily Wind and replays use the same code path as 002/005.

### 002 Hindsight: concerns
- Determinism is feasible but must be designed in. Rules: integer/fixed-point sim only; no Math.sin/cos/pow or float accumulation in the sim (last-bit differences between V8, SpiderMonkey and JSC); seeded PRNG via Math.imul; record inputs per tick.
- Share codes are tiny: 120 ticks at 2-3 bits per tick is about 40 bytes. Pin a room content hash in the code so balance patches don't break old solves.
- Concern: level design cost and narrow reach (see RICE).
- Improvement: before any level work, build 5 rooms plus a golden-hash test (same recording gives the same final-state hash) run on Chrome, Firefox, Safari and Android Chrome. Kill if it fails.

### 003 Lantern Descent: support
- Under 1.5 MB is easy if audio is small. Gzipped budget: game JS ~60 KB, one sprite atlas ~80 KB, Lodge art drawn from data on canvas (0 KB), SFX synthesized with WebAudio or at most 3 short Opus loops (~120 KB). Typical total ~300 KB.
- Trap: three 30 s MP3 loops at 128 kbps are about 1.4 MB alone. Rule: audio budget 300 KB, loaded after the first input.
- Mute-by-default and the WebAudio unlock on first pointerdown are fine; the hold input is the gesture.
- Improvement: fail the build if initial gzipped size exceeds 1.5 MB, and test on a 2019 Android Chrome with CPU throttling.

### 004 Courier Regulars: concerns
- Tech is cheap (save per delivery, date-seeded orders, no server). The cost is content: 6 regulars × ~20 lines, refreshed for live-ops.
- Scope creep for v1: postcard image generation (large canvas toDataURL on low-end phones) and the "second bike" ad.
- Impact 1 at most: the retention lift depends on dialogue nobody has tested yet.
- Improvement: cut postcards from v1 (share = text + link). Run the paper test with 1 regular and 3 lines before building meters.

### 005 Tidewake: support, if merged with 007
- Ghost re-sim is cheap. A 90 s course at 60 Hz is ~5,400 ticks, a few ms in Node. At 40k MAU (~8k DAU, ~3 finished runs each) that is ~25k sims/day, about 0.3/s average; serverless cost well under $10/month. Verify only ghosts that enter a public pool (top-K plus friend ghosts), not every run.
- Requirement: the same deterministic sim as 002 (same float rules), or honest runs get rejected. Assumption: Node's V8 matches Chrome's, but Firefox and Safari may not.
- Gate timing must use course ticks from 00:00 UTC, not performance.now() or the client clock.
- URL-encoded ghost path: ~2 KB binary becomes ~2.7 KB base64. Fine for the no-backend prototype; switch to a short KV id once a server exists, since some apps and portals truncate long URLs.

### 006 Whisper Chain: oppose (as scoped)
- Backend is cheap: KV store plus a cron for stale chains, roughly $10-30/month at 25k MAU.
- Image moderation is the money cost. Assumption: about $1-2 per 1k images from a vision API. At ~75k steps/month that is ~$75-150/month, plus human review of reports, which scales with reach and is the real cost.
- With no accounts, spam is cheap. Expect rate limits and a bot check on each submit, which adds friction to the very first turn.
- Improvement: prove solo cold start with a static archive-only prototype (50 hand-made chains in JSON, no backend, no uploads). Revisit the backend only if solo starts complete a step at 30%+.

## 2. Shared RICE (common scale)
Scale: R = share of browser-portal players who try it and get it within 30 s. I = 0.5/1/2/3. C = 0-1. E = person-months to public MVP. Score = R x I x C / E.

| # | Concept | R | I | C | E (PM) | Score |
|---|---------|---|---|---|--------|-------|
| 001 | Plume | 0.70 | 2 | 0.50 | 1.5 | 0.47 |
| 002 | Hindsight | 0.30 | 2 | 0.40 | 3.0 | 0.08 |
| 003 | Lantern Descent | 0.75 | 2 | 0.50 | 2.0 | 0.38 |
| 004 | Courier Regulars | 0.65 | 1 | 0.50 | 2.5 | 0.13 |
| 005 | Tidewake | 0.70 | 2 | 0.50 | 2.0 | 0.35 |
| 006 | Whisper Chain | 0.30 | 2 | 0.40 | 2.0 | 0.12 |
| 007 | Driftline | 0.65 | 2 | 0.55 | 1.0 | 0.72 |
| 008 | Knotwork | 0.50 | 1 | 0.60 | 0.75 | 0.40 |

- Changes from authors' numbers: Hindsight effort includes an editor and a 30-room path; Knotwork impact cut to 1 (planarity is a generic genre); Whisper reach lowered for the 30 s rule.
- Conflict note: I scored my own 007 and 008 on the same scale. Please check them.

## 3. Merge ideas
- **007 Driftline + 005 Tidewake:** same engine (one-input boat, seeded course). Driftline is the solo base; Tidewake's wake/ghost layer becomes the social layer. One sim, one determinism effort. Pick one input for v1 (tap halves is the faster start).
- **001 Plume + 003 Lantern Descent:** both hold-to-rise, release-to-fall flyers with pickups. Share one controller module, but they compete for the same slot. Pick one for the first release.
- **Infra across all daily-seed concepts (001, 002, 003, 004, 005, 007, 008):** one date-seeded generator, one share-code format (seed + version hash + inputs), one local progress store. Build once.
- **008 Knotwork + 002 Hindsight:** both deterministic puzzle seeds with share codes. Minor overlap; keep separate unless the genre vote goes puzzle.

## 4. Vote (ranked)
1. **3 pts: 007 Driftline** (with 005's ghost layer merged in). It is the cheapest deterministic base with a daily seed, one input and a share path, and the lowest tech risk in the set.
2. **2 pts: 003 Lantern Descent.** Its persistent Lodge map is the strongest D1 hook, it fits the 1.5 MB budget, and it can be tested on a 2019 Android.
3. **1 pt: 001 Plume.** Wind map and replays are cheap to build; the one-button saturation risk is the price.

Votes: 007 counts 3 (including the merged 005). Knotwork (008) is excluded because its impact is low and the genre is generic.
Open question for the group: genre. If puzzle wins, 008 and 002 move up. If action wins, the top three stand.
