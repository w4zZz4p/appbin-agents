# Round 2 review: PO-Design
- Author: PO-Design
- Focus: core loop & mechanics
- Assumptions: solo-fun core with social as a layer; rewarded/opt-in ads and cosmetics only; genre (action vs puzzle) still open.

## 1. Reviews

### 003 Lantern Descent (PO-Player): support
- Clearest one-input identity in the set. Dim-to-flicker gives unambiguous fail feedback, which answers the "did I fail or did badly" problem.
- Core-loop gap: embers add light radius, but it is unclear whether a bigger radius helps the player read hazards (skill) or only looks nice (cosmetic). Define it as hazard lookahead.
- The Lodge map is a passive reward. Fine for retention, but it must not be the only reason to play a run.
- Improvement: light radius reveals the next stalactite gap about 1 s ahead, so embers buy skill. Also define "rooms reached = depth bands" in one line.

### 004 Courier Regulars (PO-Player): concerns
- Moment-to-moment tension is low. The only pressure is a per-parcel deadline bar; once a route pattern is learned, the decision is solved, not felt. The "puzzle fatigue after 10 min" risk is named but not mitigated.
- Two-tap routing (tap parcel, tap path) adds interaction cost on a phone and needs a path preview.
- Regulars are a strong D7 hook, but they are content. They do not change what the player decides during a shift.
- Improvement: add a live element the route must answer to (a moving cat, a timed bridge), and let a regular's meter change one route rule (a trusting regular offers a shortcut). Test two-tap pathing on a phone before writing dialogue.

### 005 Tidewake (PO-Social): support
- Best moment-to-moment design in the social group. Hold/release steering through timed gates with checkpoint restart is tense but forgiving, which suits 2-15 minute sessions.
- The ghost race as a "second lap" of the same loop is the right structure: sharing does not interrupt play.
- Risk: the daily course plus ghost value leans on a server (re-sim, leaderboard). The solo-first version must work offline with a local ghost of your last run.
- Improvement: ship the seeded course with a local last-run ghost first. Add friend/top ghosts only after the 40%-second-run gate passes.

### 006 Whisper Chain (PO-Social): oppose (for this round)
- The turn is a 15-20 s task. The fun (the reveal) arrives only after several async steps, so a solo visitor gets no moment-to-moment loop.
- Cold start relies on an archive, so most first visits feel like a replay of old chains. The 50% completion target is unproven.
- Backend plus moderation (M-L, 6-8 person-weeks) breaks instant play and is the most expensive concept here.
- Improvement: a no-backend solo mode where the player draws, then guesses an archived chain and sees the drift. Re-propose once the drift reveal is proven funny.

### 007 Driftline (PO-Tech): support
- One input, a clear risk curve (channel narrows and speeds up), and a sub-250 KB load. The best fit for portal instant play.
- Differentiation is thin: a one-input river runner sits close to Plume (001) and Tidewake (005). Most seconds are reaction, not decisions.
- Generator guarantee of a passable lane is essential; test it in the first prototype.
- Improvement: add a real choice, a narrow channel with more lanterns vs. a wide, safe channel. That is the decision Plume and Lantern get from energy and light, and it turns a reflex game into a skill game.

### 008 Knotwork (PO-Tech): concerns
- Cheap, accessible, and the daily knot plus streak is a clean D1 hook.
- Moment-to-moment is a puzzle with no pressure, and difficulty scales only by size. The 10th knot is the 1st one, bigger. The authors name the "generic planarity puzzle" risk but do not mitigate it in the mechanics.
- "3 stars = par+2" and free hints give little stake; the settle chime is the only reward.
- Improvement: introduce one new mechanic every ~5 knots (locked nodes, one-way cords, a move budget) so difficulty grows in kind. Keep the free hint but have it cost a move.

## 2. Shared RICE re-score (common scale)
Score = R x I x C / E. Effort = person-months to public MVP, small team.

| # | Concept | Reach | Impact | Conf. | Effort (PM) | Score |
|---|---------|-------|--------|-------|-------------|-------|
| 001 | Plume (PO-Design) | 0.60 | 2 | 0.50 | 1.5 | 0.40 |
| 002 | Hindsight (PO-Design) | 0.25 | 2 | 0.40 | 3.0 | 0.07 |
| 003 | Lantern Descent (PO-Player) | 0.60 | 2 | 0.50 | 1.5 | 0.40 |
| 004 | Courier Regulars (PO-Player) | 0.45 | 1 | 0.50 | 2.0 | 0.11 |
| 005 | Tidewake (PO-Social) | 0.50 | 2 | 0.50 | 1.5 | 0.33 |
| 006 | Whisper Chain (PO-Social) | 0.35 | 1 | 0.30 | 2.5 | 0.04 |
| 007 | Driftline (PO-Tech) | 0.70 | 1 | 0.60 | 1.0 | 0.42 |
| 008 | Knotwork (PO-Tech) | 0.60 | 1 | 0.50 | 0.75 | 0.40 |

Note: 001, 003, 007, 008 sit within about 0.02 of each other. Treat them as tied within error; Effort and Confidence decide the order.

## 3. Merge ideas
- **One-input seeded-course family:** 001 Plume (wind zones), 003 Lantern (light meter), 005 Tidewake (ghosts, daily course), 007 Driftline (procedural river, daily seed) all share hold/steer, a daily seed, and a score to share. Proposed merge: base = 007 engine (tiny load), plus 005 ghost wakes, plus 003's dim-to-flicker as the fail rule, with 001's wind zones as Tidewake's weekly modifier. Counts as a vote for 007.
- **Ghost replay:** 002 Hindsight and 005 Tidewake both record inputs and replay them deterministically. Tidewake's ghost layer is the cheaper stepping stone; Hindsight solve codes can reuse it later.
- **Daily ritual:** 004, 005, 007, 008 all use a date-seeded daily. Build one shared seed and share service, not four.
- 006 Whisper Chain has no real overlap; keep it separate.

## 4. Vote
1. **(3 pts) 007 Driftline:** The cheapest, most portal-ready one-input core; test it first and use it as the base for the merged family.
2. **(2 pts) 003 Lantern Descent:** Best onboarding and fail feedback, and the map gives a retention artifact without a paywall. Needs the light-as-lookahead fix.
3. **(1 pt) 005 Tidewake:** The strongest social and ghost layer in the set, and it works solo-first with a local ghost.

My own 001 Plume is not in the top 3. It is strong on feel, but it overlaps heavily with 007 and 005; I would rather see its wind zones merged into the base than ship it standalone.
