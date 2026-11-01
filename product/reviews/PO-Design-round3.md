# Round 3 review: PO-Design (core loop & mechanics)
- Author: PO-Design
- Reviewed: `product/VISION.md` (PO-Player), `product/PROTOTYPE.md` (PO-Tech), against decision 001

## Stance
- **VISION.md: approve with changes.** Pillars and journey are right; the journey mixes P0-P2 features.
- **PROTOTYPE.md: approve with changes.** Stage in/out lists are good; the choice is parked and the input is undefined.
- Neither is blocked. I would block P0 scope if the lane choice stays out with no readout, since pillar 1 requires it.

## Inconsistencies
1. **Input:** VISION says "tap"; the hint says "Tap a side to nudge"; PROTOTYPE samples a held bit per tick. These are different mechanics.
2. **Space key:** PROTOTYPE maps Space to steering, but Space has no side, so it breaks the left/right input.
3. **Choice:** VISION pillar 1 says the choice "must be proven in the prototype." PROTOTYPE makes it optional, outside the gate, and only if P0 lands at 25-39%.
4. **Pillar 3 vs P2:** pillar 3 says "every run lights something," but PROTOTYPE P2 lights one reach per new depth band. A run that reaches no new band lights nothing.
5. **Scope:** VISION's 2-min and end-of-session rows show a lit map, a save prompt, and a continue offer before run 2. PROTOTYPE puts the map in P2 and bans ads in P0-P2.
6. **Ads and continue:** "continue" is not in the second-run metric or the share code, though it changes the run's inputs. The take-up metric (5-10% of deaths) has no stage that builds it.
7. **FPS:** VISION target 55+, kill under 45. PROTOTYPE p50 60, p5 at least 50. Load/FPS are VISION gate goals but are missing from P0 Go criteria.
8. **Determinism:** VISION says any mismatch blocks ghosts. PROTOTYPE P1 allows a 3-day fix before dropping ghosts.
9. **Budgets/audio:** VISION's 250 KB is game code plus atlas; PROTOTYPE also counts HTML/CSS (stricter, adopt it). VISION has an ambient loop; PROTOTYPE P0-P2 have 3 SFX only.
10. **Sample size:** with 10-15 testers, one person moves the 40% gate by 7-10 points. Pool the P0 iteration round into the gate.
11. **Fairness:** Go is at least 80% "own fault" and Kill is above 30% complaints. The 20-30% band is undefined.
12. **Share rate:** VISION target 3-5%, kill under 1%. No stage measures it.

## Answers to questions addressed to me
**Q1. Narrow lantern lane vs wide safe lane in P0 behind a flag? Yes, must.**
- Pillar 1 must be tested, and reflex-only fun can pass the gate while hiding a game with no choice.
- Two arms, split evenly by `?lanes=0|1`: arm 0 is wide-only (control), arm 1 has the choice.
- The fork appears at least 2 s before the split. Otherwise it is a reaction, not a decision.
- Wide lane is passable by construction. Narrow lane is passable per bot check. Narrow carries more lanterns and more score.
- Readouts: narrow-pick rate (target 25-75%; under 10% or over 90% means dominated, retune), score and run length per arm, and a "did you take the risky line" self-report.
- Bot check on 1,000 seeds: greedy-narrow vs safe-wide expected scores within about 20% of each other.
- If arm 1 second-run rate is below arm 0, cut the choice before P1. Cost is about 2 days, which fits the 6-8 day P0.

**Q2. Is tap-left/right-halves the right single input? Yes for P0, with these changes.**
- Hold semantics: a held half steers that way, release drifts straight. Taps shorter than the sample get a minimum pulse (about 6 ticks / 100 ms) so casual taps are not lost.
- Both sides held, or both keys, means straight. A second pointer is ignored. Use pointer capture so dragging off the half keeps the state.
- Desktop: mouse click on halves, A/D and arrows. Drop Space.
- Portrait: keep the boat in the middle third so it is not hidden under the thumb.
- Caveat: a binary input expresses the lane choice only through early steering, so fork timing carries the choice. Do not add a third input in v1 (brake, boost); use wind zones post-MVP if P0 shows saturation.

## Requested edits
- **must** VISION.md → First-session journey, 0 s row → "Tap a side to nudge." becomes "Hold a side to steer."
- **must** VISION.md → Core loop → "Tap the left or right half" becomes "Hold the left or right half to steer; release to drift."
- **must** PROTOTYPE.md → 3 Input → define hold semantics, minimum pulse, both-sides-straight, pointer capture; remove Space.
- **must** PROTOTYPE.md → 2 P0 "Optional, behind a flag" → make the lane choice a required A/B arm in P0 with the readouts and bot check above; the gate applies to arm 1, arm 0 is control.
- **must** VISION.md → Design pillar 3 → "Every run lights something" becomes "Every run lights a map segment proportional to distance (minimum one segment)." Fits the P2 rule in the next line.
- **must** PROTOTYPE.md → 2 P2 "In" → change "one lit reach per depth band" to match the pillar 3 rule above.
- **must** VISION.md → First-session journey, 2 min and End rows → split into "P1 launch" and "after P2"; move the lit map, save prompt and continue offer to the "after P2" part.
- **must** VISION.md → Business model and journey → continue offer is "P3, after P2"; no ads in P0-P2, matching PROTOTYPE.
- **must** PROTOTYPE.md → 3 Share code and 2 P1 metrics → define "second run": a continue does not count as a new run. Encode continue as an input event in the share code and ghost.
- **must** PROTOTYPE.md → 2 P0 Go → add: FPS p5 at least 50 on 2019 Android, restart under 1 s at p95, first lantern under 5 s guaranteed on the safe line.
- **must** VISION.md → Success metrics FPS row and PROTOTYPE.md → 3 Budgets → one threshold: target p50 60 / p5 50, kill p5 under 45.
- **must** PROTOTYPE.md → 2 P1 Kill → align with VISION determinism row: any mismatch blocks ghosts after a 3-day fix window, with a named owner.
- **must** PROTOTYPE.md → 2 P0 Go → pool the iteration round into the gate (at least 20 testers) and state the sample-size caveat.
- **must** VISION.md → 3 Art & audio and PROTOTYPE.md → 2 P0 → lanterns "widen your view" becomes "lantern reveals the next gap about 1 s ahead"; otherwise lanterns are cosmetic, not skill.
- **nice** PROTOTYPE.md → 2 P0 Metrics → add median first-run death at 20-40 s (VISION's 30 s claim) and restart latency.
- **nice** PROTOTYPE.md → 2 P0 Go → define 20-30% complaints as iterate.
- **nice** VISION.md → Success metrics → share rate: measured from P1, kill under 1%.
- **nice** VISION.md and PROTOTYPE.md → terms: pick "stretch" and "river map"; drop "reach", "depth band", "Lodge map".
- **nice** VISION.md → Audio → move the ambient loop to P2 or drop it.
- **nice** VISION.md → Non-goals → add: portal-mandated breaks only between runs, never mid-run (needs a user decision, PROTOTYPE open question 5).

— PO-Design
