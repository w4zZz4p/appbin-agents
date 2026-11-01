# Game Vision

- **Working title:** Driftline (placeholder; "driftline" is a common phrase, so run a store and trademark name check before launch)
- **Genre & one-line pitch:** One-input river runner. "Hold a side to steer a paper boat down a river that narrows and speeds up. Thread the lanterns, and each run lights a stretch of your river map."
- **Core fantasy:** Calm, then suddenly tense. You are a small, fragile boat on a big, indifferent current, and you are very good at threading gaps.
- **Core loop:** Hold the left or right half of the screen to steer that way; release to drift. Holding both sides steers straight. Desktop: mouse held on a half, or A/D and arrow keys. Lanterns reveal the next gap about 1 s further ahead, so they buy skill, not just looks. Rocks and banks end the run. The crash shows the stretch you reached, and "Drift again" restarts in under 1 s.
- **Target players:** Casual browser-game players who find games on portals (CrazyGames, Poki, itch.io), search, or links. They want to understand a game in 3 seconds and drop in and out of it. Secondary: score-chasers who share a result with a friend. They play short arcade games now, on phones in portrait during breaks and on desktop in a spare tab.
- **Platforms:** Both. Mobile browser (portrait-first, touch, rotation allowed) and desktop browser (mouse or keyboard). Canvas 2D scales to any window. Portal embed is the primary channel.
- **Session length target:** 4–8 minutes (about 8–15 runs of 30–90 s each).
- **Single-player / multiplayer:** Solo-fun core, with social as a layer. v1 is solo with a local ghost of your last run. Friend ghosts via a shared link ship in P1 (decision 001), with no server: the link carries seed, version and inputs. Server leaderboards and re-simulation come last. No real-time multiplayer.
- **Art & audio style:** Minimal vector or pixel art, one sprite atlas PNG, a palette that shifts with river depth. Three short SFX in P0–P1; ambient loop in P2 or dropped. Audio starts after the first press.
- **Business model:** No ads in P0–P2. From P3, one opt-in rewarded "continue from last lantern" per run, never forced. A continue is not a new run: it is an input event in the share code and ghost, and it does not count toward the second-run metric. Cosmetic boats and wake trails. No interstitials ever. No pay-to-win; ghosts and scores are never for sale.
- **Goals this period:** P0 gate, on lane arm 1 with the iteration round pooled (at least 20 testers): 40% or more start a second run within 5 minutes; first lantern within 5 s on the safe line; restart under 1 s at p95; FPS and load within budget. Then P1 (link ghosts, challenge loop) and P2 (river map), measuring the D1 lift.
- **Tech & team constraints:** Plain JavaScript and Canvas 2D, no framework. Game code, atlas, HTML and CSS together at or under 250 KB gzipped; platform total 1.5 MB; audio 300 KB, loaded after the first press. Fixed-step, integer or fixed-point simulation, so the daily seed and ghosts replay identically across browsers. Daily seed from the UTC date. No server in v1. localStorage for scores and map; the game must work if storage is wiped. Team: 1 developer plus a part-time artist and audio maker. About 1 person-month to a public MVP.
- **Non-goals:** See the section below.

## First-session journey
- **0 s:** The page opens straight into the river. No title screen or menu. The boat is already drifting, with a one-line hint: "Hold a side to steer." Playable within 3 s on a mid-range phone on 4G.
- **10 s:** The boat threads its first gap and collects the first lantern, which sits on a guaranteed safe line and is reached within 5 s. The lantern shows the next gap ahead. The player has felt "I control this" once.
- **30 s:** The river narrows and speeds up. Most first runs end here (target median 20–40 s). The crash shows "Reached stretch 2" with the boat's path, not "Game over." The hint fades.
- **Challenged arrival (P1):** A player who opens a challenge link lands in the river with no title screen and sees the challenger's wake from run 1. The link plays its linked seed, even after the UTC day rolls over, then offers today's river. A version mismatch shows "this wake is from an older version."
- **2 min (P1 launch):** 3–5 runs. The best run and the last run are saved. From run 2, a faint wake shows the last run's ghost to race, on the same seed only. A line says "Today's river, same for everyone."
- **2 min (after P2):** The first stretch of the river map is lit. Each run lights a stretch in proportion to distance, with at least one.
- **End of first session (P1 launch):** The player has a personal best and a reason to return: tomorrow's daily river. A share action (text and link, no image) is available.
- **End of first session (after P2):** The lit map carries over to tomorrow. The optional "save your progress" prompt appears after run 3 and never blocks play. The rewarded continue is offered from P3 only, and never before run 2.

## Design pillars
1. **Real choices, not just reflexes.** Each run has a channel choice: a narrow, lantern-rich lane or a wide, safe lane. It is tested in P0 as a required A/B arm (`?lanes=0|1`; arm 0 is wide-only control). The fork is visible at least 2 s ahead. If arm 1's second-run rate is below arm 0's, the choice is cut before P1.
2. **Fair, short failure.** The generator always guarantees a passable lane. Every crash teaches something, and restart takes under 1 s.
3. **Progress is always visible.** Every run lights a river-map stretch in proportion to distance, with a minimum of one (from P2). The map is a reward, never the only reason to play. The run must be fun on its own.
4. **Sharing is the second lap.** Everyone races the same daily river. Local ghost first, then friend ghosts by link (P1). Playing and racing use the same deterministic simulation.

## Success metrics (targets)
| Metric | Target | Kill or rethink if |
|---|---|---|
| Time to first lantern (median) | 5 s or less | Over 10 s |
| Median first-run death | 20–40 s | Under 15 s or over 60 s |
| Second run within 5 min (P0 gate, arm 1, pooled, at least 20 testers) | 40% or more | Under 30%; 30–39% iterates |
| Restart latency | Under 1 s at p95 | Over 1.5 s |
| Session length (median) | 4–8 min | Under 2 min |
| Challenge conversion (challenge open to played run, P1) | 25% or more | Under 15%; 15–24% iterates |
| Share rate, per session (copy or native share) | 3–5% | Under 1% (measured from P1) |
| Share rate, per finished run | 5% or more | Under 2% |
| Challenge opens per share (soft launch only) | 0.5 or more | Under 0.2 |
| D1 retention | 30% (25% acceptable) | Under 20% after the map step |
| Map lift on D1 (versus no-map baseline) | +5 points (assumption) | Under +2 points |
| Rewarded continue take-up (from P3) | 5–10% of deaths | Over 15% with falling D1 |
| Initial load (game code, atlas, HTML and CSS, gzipped) | 250 KB or less | Over budget in a build check |
| Playable time on 4G, mid-range phone | 3 s or less | Over 5 s |
| FPS on 2019 low-end Android (Chrome) | p50 60 and p5 50 or more | p5 under 45 |
| Determinism (golden-hash test: Chrome, Firefox, Safari, Android Chrome) | 0 mismatches | Any mismatch blocks ghosts after a 3-day fix window, with a named owner |

Assumptions to validate: the D1 numbers come from proposals 003 and 007, not playtests. ARPDAU of $0.01–0.03 from rewarded ads is also an assumption. With 20–30 testers, one person moves the 40% gate by 5–10 points, so treat results as directional. Challenged-arrival second-run rates are reported separately and kept out of the gate.

## Non-goals
- No account, login, or email wall in v1. Email is optional after run 3.
- No interstitial ads, and no ads at all in P0–P2. The only ad is the opt-in continue from P3.
- No pay-to-win: no purchasable power, lives, energy timers, or ghost and score purchases.
- No real-time multiplayer, chat, or user-generated content in v1.
- No third input in v1 (no brake or boost, no Space key). Wind zones are a post-MVP option if P0 shows saturation.
- No tide gates, weekly modifiers, or wind zones in v1. These come after the one-input gate passes.
- No server-only social features in v1: no "Sea" panel of three ghosts, and no top-wake or near-score ghosts. Link ghosts (P1) are in scope.
- No generated images in v1: no share image, no wake card, no map image at death, no postcards.
- No Lodge-style lore or story text beyond one-line river notes.
- No streak guilt. A missed day costs nothing.
- No leaderboard server in v1. It comes later.
- No mid-run portal breaks. Portal-mandated breaks happen between runs only (pending user decision).
- No puzzle genre in this title. Knotwork (decision 001) stays deferred.
