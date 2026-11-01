# 003: Lantern Descent
- Author: PO-Player
- Status: proposed
- Focus: player experience, onboarding & retention

**Pitch:** A one-input cave descent where you are a small lantern-bearer falling through a shaft; each run is 60–120 seconds, and every lit room you leave behind fills in a map of the cave that you carry into the next run.

**Core fantasy:** Being the brave small light in a dark place. You make the dark a little smaller each time you go down.

**30-second core loop:**
1. Hold anywhere to glide; release to drop. The lantern sinks, one input only.
2. Thread gaps between stalactites; collect embers (score and light fuel).
3. Each ember adds a pixel of light radius; a hit dims you to a flicker and ends the run.
4. Run ends at the bottom: the room you reached lights up on the Lodge map. Tap "Descend again" (under 2 s).

## Player problem / opportunity
- Players arriving from a portal link need to understand the game in one tap, not read a tutorial.
- Most arcade runners have no visible "my progress" beyond a high score. The Lodge map gives a permanent, growing picture of effort, which is the hook for D1/D7 return.
- Assumption: players who quit at 20 seconds are mostly confused about when they "failed" vs. "did badly"; the instant dim-to-flicker feedback plus the lit-room reward should fix that. Needs playtest proof.

## Proposed feature
- **First 30 s:** No menu. Game starts on tap. Stalactite gap 1 is wide; the first ember is placed on the safe line. Death shows "Reached room 4" and the lit map, not "Game over".
- **Lodge map:** Each run lights 1+ rooms (rooms reached = depth bands). Rooms have one-line lore fragments; a complete band unlocks a new lantern colour (cosmetic, no power gain).
- **Daily shaft:** One seeded cave per day, same for everyone. Compare depth and show the lanterns of friends who played it (ghost glow, no names required).
- **Share:** Auto-generated 9:16 image of your lit map at death; one-tap copy link to today's shaft.
- **No paywall in core loop.** Optional rewarded ad = "relight a dark room" once per run.

## Platform notes
- **Mobile:** Portrait, whole-screen hold/release. Works one-handed. Good for spare-tab play.
- **Desktop:** Space/mouse hold. Same loop.
- **Load:** Canvas 2D or lightweight WebGL sprite batch; target < 1.5 MB initial, Lodge art lazy-loaded.
- **Storage:** Lodge progress in localStorage, mirrored to an optional account later. Browser wipe loses map; show a gentle "save your light" prompt after run 3 (email optional).
- **Server:** Daily shaft seed is static (date-derived); ghost lights need a small leaderboard endpoint, can be deferred.

## Value & metrics
- D1 retention: target +5–8 pts from the lit-map return hook (assumption, to validate).
- Session length: 4–8 min target (3–6 runs of ~90 s).
- Share rate: auto-image should lift shares per DAU meaningfully; target 3%+.
- Time to first fun: first ember collected within 10 s; first lit room within 60 s.

## RICE (rough)
- Reach: 80% of visitors reach the first run.
- Impact: 2 (core-loop identity + retention hook).
- Confidence: 60% (mechanic is well-trodden; map hook is the unproven part).
- Effort: M (~4–6 weeks for 1 dev + 1 artist for prototype).
- Score: (0.8 × 2 × 0.6) / M ≈ strong candidate.

## Effort & risks
- **Art:** Silhouette-first pixel art, 1 palette per depth band. Low cost.
- **Audio:** 3 loops + ember/dim SFX via WebAudio; must mute-by-default on autoplay-blocked browsers.
- **Risks:** Difficulty curve (too punishing kills D1); toxicity low (async ghosts, no chat); ad fatigue low if rewards are optional.
- **Scope creep:** Keep Lodge lore to text only in v1.

## Smallest playable test
Grey-box: one screen, hold/release, embers, dim-on-hit, and a static map that lights one room per death. Test with 15 players on mobile: measure time to first retry and whether they say "one more" unprompted. Kill if < 40% retry within 60 s.

## Review
<!-- Other POs append here: -->
