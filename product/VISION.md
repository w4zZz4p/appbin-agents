# Game Vision

- **Working title:** Driftline (placeholder; "driftline" is a common phrase, so run a store and trademark name check before launch)
- **Genre & one-line pitch:** One-input river runner. "Tap a side to nudge a paper boat down a river that narrows and speeds up. Thread the lanterns, and each run lights a stretch of your river map."
- **Core fantasy:** Calm, then suddenly tense. You are a small, fragile boat on a big, indifferent current, and you are very good at threading gaps.
- **Core loop:** Tap the left or right half of the screen (A/D or arrow keys on desktop) to nudge the boat through the channel. Lanterns add score and widen your view of the river ahead, so they buy skill, not just looks. Rocks and banks end the run. The crash shows the stretch you reached, and "Drift again" restarts in under 1 s.
- **Target players:** Casual browser-game players who find games on portals (CrazyGames, Poki, itch.io), search, or links. They want to understand a game in 3 seconds and drop in and out of it. Secondary: score-chasers who share a result with a friend. They play short arcade games now, on phones in portrait during breaks and on desktop in a spare tab.
- **Platforms:** Both. Mobile browser (portrait-first, touch, rotation allowed) and desktop browser (mouse or keyboard). Canvas 2D scales to any window. Portal embed is the primary channel.
- **Session length target:** 4–8 minutes (about 8–15 runs of 30–90 s each).
- **Single-player / multiplayer:** Solo-fun core, with social as a layer. v1 is solo with a local ghost of your last run. Friend ghosts via a shared link come next (no server). Server leaderboard and re-simulation come last. No real-time multiplayer.
- **Art & audio style:** Minimal vector or pixel art, one sprite atlas PNG, a palette that shifts with river depth. Three short SFX and one ambient loop. Audio starts after the first tap.
- **Business model:** Opt-in rewarded ad only: one "continue from last lantern" per run, never forced and never during a run otherwise. Cosmetic boats and wake trails. No pay-to-win. Ghosts and scores are never for sale.
- **Goals this period:** Prototype passes the gate: at least 40% of testers start a second run within 5 minutes; first lantern within 5 s; initial load within budget; 60 FPS on a 2019 Android Chrome. Then add the river map and measure the D1 lift.
- **Tech & team constraints:** Plain JavaScript and Canvas 2D, no framework. Game code plus atlas at or under 250 KB gzipped, with the platform total at 1.5 MB and audio at 300 KB, loaded after the first input. Fixed-step, integer or fixed-point simulation, so the daily seed and ghosts replay identically across browsers. Daily seed from the UTC date. No server in v1. localStorage for scores and map, and the game must work if storage is wiped. Team: 1 developer plus a part-time artist and audio maker. About 1 person-month to a public MVP.
- **Non-goals:** See the section below.

## First-session journey
- **0 s:** The page opens straight into the river. No title screen or menu. The boat is already drifting, with a one-line hint: "Tap a side to nudge." Playable within 3 s on a mid-range phone on 4G.
- **10 s:** The boat threads its first gap and collects the first lantern. The first lantern sits on a guaranteed safe line, reached within 5 s. The view widens. The player has felt "I control this" once.
- **30 s:** The river narrows and speeds up. Most first runs end here, and the crash shows "Reached stretch 2" with the boat's path, not "Game over." The hint fades.
- **2 min:** 3–5 runs. The first stretch is lit on the river map and the best score is saved. From run 2, a faint wake shows the last run's ghost to race. A line says "Today's river, same for everyone."
- **End of first session:** The player has a personal best, a lit stretch of their map, and a reason to return: tomorrow's daily river continues the same map. The optional "save your progress" prompt appears after run 3 and never blocks play. The rewarded continue is not offered before run 2.

## Design pillars
1. **Real choices, not just reflexes.** Each decision is a channel choice: a narrow, lantern-rich lane or a wide, safe lane. This must be proven in the prototype. If it is only reflex, add the choice before anything else.
2. **Fair, short failure.** The generator always guarantees a passable lane. Every crash teaches something, and restart takes under 1 s.
3. **Progress is always visible.** Every run lights something on the river map, so a bad run still shows progress. The map is a reward, never the only reason to play. The run must be fun on its own.
4. **Sharing is the second lap.** Everyone races the same daily river. Local ghost first, then friend ghosts by link. Playing and racing use the same deterministic simulation.

## Success metrics (targets)
| Metric | Target | Kill or rethink if |
|---|---|---|
| Time to first lantern (median) | 5 s or less | Over 10 s |
| Start a second run within 5 min (prototype gate) | 40% or more | Under 40% |
| Session length (median) | 4–8 min | Under 2 min |
| D1 retention | 30% (25% acceptable) | Under 20% after the map step |
| Map lift on D1 (versus no-map baseline) | +5 points (assumption) | Under +2 points |
| Share rate (share or challenge link per session) | 3–5% | Under 1% |
| Rewarded continue take-up | 5–10% of deaths | Over 15% with falling D1 |
| Initial load (game code plus atlas, gzipped) | 250 KB or less | Over budget in a build check |
| Playable time on 4G, mid-range phone | 3 s or less | Over 5 s |
| FPS on 2019 Android Chrome | 55 or more | Under 45 |
| Determinism (golden-hash test across Chrome, Firefox, Safari, Android Chrome) | 0 mismatches | Any mismatch blocks ghosts |

Assumptions to validate: the D1 numbers are from proposals 003 and 007, not from playtests. ARPDAU of $0.01–0.03 from rewarded ads is also an assumption.

## Non-goals
- No account, login, or email wall in v1. Email is optional after run 3.
- No interstitial ads and no forced ads. The only ad is the opt-in continue.
- No pay-to-win: no purchasable power, lives, energy timers, or ghost and score purchases.
- No real-time multiplayer, chat, or user-generated content in v1.
- No tide gates, wind zones, or weekly modifiers in v1. These are post-MVP modifiers, after the one-input gate passes.
- No Lodge-style lore or story text beyond one-line river notes. No postcards or generated images in v1.
- No streak guilt. A missed day costs nothing.
- No server in v1. Leaderboards come later.
- No puzzle genre in this title. Knotwork (decision 001) stays deferred.
