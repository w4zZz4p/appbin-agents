# 005: Tidewake (daily courses with shareable ghost wakes)
- Author: PO-Social
- Status: accepted (merged into decision 001: ghost layer)
- Focus: social, virality & multiplayer

**Pitch:** A one-finger boat game where everyone runs the same daily tide course, and each finished run leaves a visible "wake" that friends and strangers can race as a ghost.

**Core fantasy:** Being a sharp sailor who reads the tide better than anyone, and leaving a wake others chase.

**30-second core loop:** Hold to steer, release to drift. Thread a boat through timed tide gates (open/closed on a shared clock) and grab lanterns. A crash restarts from the last gate checkpoint. Finish, see your score, and get 3 ghost wakes from the day's sea (a friend's, a top player's, one near your score). Tap one, race its ghost, retry. Repeat.

## Player problem / opportunity
- Casual score-chase games give players a number to share, but no reason to come back tomorrow or to compete with a specific friend without a live match.
- Players arriving from a portal or link need fun in the first 30 seconds and a reason to return on D1.
- Assumption: a shared daily seed plus visible ghosts gives "same course, different line" competition that feels personal without real-time servers.

## Proposed feature
1. Land on today's course (Tide #N). First course is a 20-second tutorial with one gate type.
2. Play: hold to steer, release to drift. Gates cycle on a clock shared by all players of the day.
3. Finish: score = lanterns + time bonus. Your route is saved as a compact ghost path.
4. "The Sea" panel: 3 ghosts (friend via link, a top-ranked wake, a wake near your score). Tap to race one as an overlay.
5. Daily course changes at 00:00 UTC; a weekly tide modifier (e.g. faster gates) adds variety.
6. Share: a wake card (course map + your line + score) with a challenge link: "Beat my wake on Tide 412."
- Core loop touch: the ghost race is the second lap of the same 30-second loop, so sharing and playing are the same action.

## Platform notes
- Mobile: hold anywhere in portrait to steer; no tiny targets. Desktop: hold mouse or Space.
- Canvas 2D is sufficient. Target initial load under 1 MB; lazy-load the leaderboard and wake renderer.
- Ghost path: ~1-2 KB of quantized inputs per run. Course is seeded, so it runs offline; ghosts and leaderboard need a small serverless endpoint.
- Storage: best scores in local storage (wipes are tolerable; nothing essential lost).
- Anti-cheat: ghosts are re-simulated deterministically on the server before they reach a leaderboard.

## Value & metrics
- D1 retention: target +5 pp versus a no-ghost baseline (assumption, to validate).
- Share rate: 8% of finishers share a wake card.
- Challenge-link click-through: 25% of opened links lead to a played run.
- Session length: 4-8 minutes across 2-3 courses.

## Effort & risks
- Effort: M (about 4-6 person-weeks for a polished v1).
- Art/audio: simple vector sea, boat, gate and lantern sprites; ambient wave loop plus 3 sound effects.
- Risks: cheating (mitigated by server re-simulation); unfair daily seeds (needs a difficulty check before publishing); ghost clutter (cap at 3 visible); leaderboard toxicity (show only friends and nearby scores by default).
- No pay-to-win: ghosts and scores are never purchasable.

**RICE (assumed inputs):** Reach 40k players/month, Impact 1.0 (scale 0.5-3), Confidence 60%, Effort 5 person-weeks. Score = 40000 x 1.0 x 0.6 / 5 = 4800.

## Smallest playable test
- One week: single boat, 5 hand-tuned gate patterns, seeded daily course, last run shown as a local ghost, and a "copy challenge link" that encodes the ghost path in the URL (no backend).
- Test with ~30 players from a link: do they retry after a fail, and do they open a shared ghost link?
- Kill criterion: fewer than 40% of players make a second run within 5 minutes.

## Review
<!-- Other POs append here: -->
<!-- - **PO-Name** (support | concerns | oppose): reason -->
