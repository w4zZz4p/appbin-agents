# 008: Knotwork (concept)
- Author: PO-Tech
- Status: deferred (puzzle fallback, see decision 001)
- Focus: tech & performance

**Pitch:** A tangle of glowing nodes and cords. Drag the nodes until no two cords cross. Each puzzle is a seed, so anyone with the link gets the same tangle.

**Core fantasy:** Quiet, satisfying untangling. You are the calm person who sorts out the mess, and you can feel the moment it "clicks."

## 30-second core loop
1. A tangle appears: 6–12 nodes, cords between some pairs, crossings shown in a warm red.
2. Drag a node anywhere; cords follow with a soft spring. Crossings turn from red to clear as you fix them.
3. When zero crossings remain, the knot "settles" with a chime and a score based on moves used. Next tangle loads in under 300 ms.

## Player problem / opportunity
- Players on portals and in a spare tab want a 30–90 s puzzle with zero reading. Many puzzle games need levels downloaded or a tutorial.
- Opportunity: a puzzle whose entire state is a seed plus a list of node positions. Almost no CPU, no physics engine, no assets. Works well on a weak phone and on a flaky connection because nothing needs streaming.

## Proposed feature (first version)
- Endless tangles from a seeded generator. Generator guarantees the tangle is solvable (it starts from a planar layout and randomly shuffles nodes, so a zero-crossing layout always exists).
- Scoring: fewer total node moves = more stars (3 stars = at or under the generator's par + 2).
- **Daily knot** from the date seed, same for everyone. Shareable as a link with the seed and your star count, no account.
- Hint button: briefly highlights one crossing pair. Hints cost nothing in v1 (to keep it friendly); revisit once we see usage.
- Progress: one streak counter and a grid of the last 30 daily knots (completed / stars). Stored locally.

## Platform notes
- **Mobile:** drag by finger, pinch to zoom out for large tangles. Touch target is the node radius, enlarged to 44 px minimum. Portrait layout.
- **Desktop:** mouse drag; keyboard arrows move the selected node for accessibility.
- **Rendering:** SVG or Canvas 2D, redraw only on drag (no continuous animation loop beyond the settle effect). Expected CPU use near zero when idle, which matters for battery on phones.
- **Download:** estimated < 150 KB gzipped (code ~50 KB, no images, one font subset or system font). Playable offline after first load (PWA-style cache, optional).
- **Storage:** localStorage for streak and history. Losing it resets streak only.
- **Server:** none for v1. Daily seed comes from the client date. Global "stars today" needs a tiny counter endpoint, later and optional.

## Value & metrics
- Time to first fun: < 5 s to first drag; first "settle" within 30 s (generator starts with easy 6-node tangles).
- Average session: 5–10 min (about 6–12 knots).
- D1 retention: target 30%+ (daily ritual plus streak).
- Share rate: "I solved today's knot in 7 moves" link; target 5%+ of completions.
- ARPDAU: ads between knots (not during drag) and optional cosmetic cord/node themes. Assumption: ~$0.02–0.04 per DAU at portal rates.

## Effort & risks
- Size: **S** (one developer, 2–4 weeks to v1 with generator tests, touch tuning, and accessibility).
- Art/audio: vector only; soft ambient loop optional, mutable from the first screen.
- Risks: difficulty curve depends on generator quality, so budget time for playtesting with a simple "par" calibration. Risk of the game feeling too similar to generic planarity puzzles; differentiate with the settle animation and daily shared knot. Scope creep: resist adding levels or unlocks before D7 data.
- RICE (rough): Reach 50%, Impact 2, Confidence 75%, Effort 2.5 person-weeks → 0.5 × 2 × 0.75 / 2.5 × 1000 ≈ 300.

## Smallest playable test
- One-week prototype: generator for 6–10 nodes, drag and crossing detection, settle chime, no menus. Test on a low-end Android and a laptop with 20 testers over a shared link.
- Measure: median time to solve, percentage who solve a second knot without prompting, and whether the generator's "par" feels right (testers solve in 1.2–2x par).
- Kill criteria: fewer than 50% of testers solve a second knot, or fewer than 1 in 5 say they'd return tomorrow.

## Review
<!-- Other POs append here: -->
