# 004: Courier Regulars
- Author: PO-Player
- Status: proposed
- Focus: player experience, onboarding & retention

**Pitch:** You run a bicycle courier route through a small, hand-drawn town. Plan a few tap-routes per shift, and the same townsfolk ("regulars") come back to you with orders, stories, and grudges, so every shift feels like visiting people you know.

**Core fantasy:** Being the one who knows everybody's business and gets the parcel there on time, even when the rain makes the roads a mess.

**30-second core loop:**
1. A parcel appears at a house with a deadline bar and a tiny note from its sender.
2. Tap the parcel, then tap a path to its address; the route draws across the grid of streets.
3. Avoid puddles, closed roads, and the cat that blocks the step; each correct route earns coins and a reaction from the receiver.
4. Next order appears immediately. Shift ends after ~5 min or 6 deliveries; the regulars tell you how it went.

## Player problem / opportunity
- Route puzzlers are satisfying but forgettable: no reason to return to the same game tomorrow.
- Players in a first session need a clear goal in seconds, and the regulars give a human "why" (someone is waiting for you) that drives return visits.
- Assumption: a recurring cast with 1–2 lines of dialogue per visit is enough to create "I want to see what Mrs. Adeyemi says" without any server-side story system.

## Proposed feature
- **First 30 s:** Tutorial is the first delivery itself: one road, one parcel, a cheerful receiver. The first route is pre-drawn as a hint, faded out after one correct tap.
- **Regulars:** About 6 townsfolk in v1. Each has a relationship meter that rises with on-time deliveries and drops with late ones. Meter level unlocks a short note and a new order type (fragile, cold, urgent).
- **Morning post (daily):** One daily set of 3 orders, identical for everyone. Earn a postcard stamp per completed set; postcards are shareable as an image of a regular's reply.
- **Shift length:** 4–6 min. Save state after each delivery so tabs can be left and resumed.
- **Monetization (optional):** Rewarded ad for a "second bike" extra shift after a failed shift; cosmetics (bike bells, rain capes). No premium route shortcuts.

## Platform notes
- **Mobile:** Tap-to-tap routing works in portrait; the grid is simple. Use large touch targets; avoid drag-only gestures.
- **Desktop:** Click-to-click, same loop; optional keyboard arrows to step.
- **Load:** Tile-based 2D with SVG or canvas; under 1 MB initial. Town sprites and dialogue are small text/JSON.
- **Storage:** Regulars' meters and stamps in localStorage; export code shown in the settings menu for backup.
- **Server:** Daily order set is a date-seeded deterministic generator; no server needed for v1. Postcard sharing = static image generated client-side.

## Value & metrics
- D1 retention: target +4–6 pts from regulars' pull (assumption).
- D7 retention: target 12–15% via relationship meters and daily set.
- Session length: 5–10 min across 2–3 shifts.
- Share rate: postcard shares, target 2–4% of DAU.
- Time to first fun: first delivery complete in under 45 s; first regular's reaction by minute 2.

## RICE (rough)
- Reach: 70% of visitors (the first delivery is accessible to most).
- Impact: 1.5 (strong retention, lower moment-to-moment excitement than an action game).
- Confidence: 65% (route-puzzle genre has validated demand; regular system is the uncertain part).
- Effort: M (~4–5 weeks for 1 dev + 1 artist).
- Score: (0.7 × 1.5 × 0.65) / M ≈ good candidate, slightly behind 003 on impact.

## Effort & risks
- **Content:** Dialogue writing is the real cost. ~6 regulars × ~20 lines = manageable, but must stay fresh over months (live-ops risk).
- **Balance:** Route difficulty scaling; keep first 5 shifts gentle.
- **Risks:** Puzzle fatigue after ~10 minutes; ad fatigue if "second bike" triggers too often; toxicity low (no competition except optional daily leaderboard).
- **Scope creep:** Postcard sharing can slip to v2 if the image pipeline is costly.

## Smallest playable test
Paper prototype plus one browser grid: 3 houses, 2 hazard types, 1 regular with 3 lines of dialogue. Test with 12 players on phone: ask at minute 10 "would you open it again tomorrow to see Mrs. Adeyemi?". Kill if fewer than 50% say yes or if median first-delivery time exceeds 60 s.

## Review
<!-- Other POs append here: -->
