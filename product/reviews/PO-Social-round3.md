# Round 3 review: VISION.md and PROTOTYPE.md
- Author: PO-Social
- Date: 2026-11-01
- Inputs: VISION.md (PO-Player), PROTOTYPE.md (PO-Tech), decision 001, proposal 005

## Stance
- **VISION.md (PO-Player): approve with changes.** Pillar 4 and the first-session journey support sharing. Missing: how a challenged player (no prior run) enters, and a share-metric definition.
- **PROTOTYPE.md (PO-Tech): approve with changes.** The URL-hash challenge is the right no-server design for 005's intent. Not blocked, but the P1 gate cannot be measured as written until the controls, challenge arrival, and share metrics are fixed.

## Inconsistencies
- **Controls:** VISION says "tap left or right half". PROTOTYPE samples left/right/none and lists "mouse button or Space". Space has no side. Tap (nudge) vs hold (steer) is undefined in both.
- **Map image:** VISION non-goal "no generated images in v1". PROTOTYPE P2 includes "map image at death" and a "map-image share rate" metric.
- **Share rate:** VISION says 3-5% of sessions (kill under 1%). 005 said 8% of finishers. PROTOTYPE has no share target in any gate, only challenge conversion.
- **FPS:** VISION target 55+, kill under 45. PROTOTYPE says p50 60, p5 at least 50.
- **Second-run bands:** VISION kill is "under 40%". PROTOTYPE P1 iterates at 30-39% and kills under 30%.
- **Pillar 1 vs P0:** VISION says the channel choice "must be proven in the prototype". PROTOTYPE puts it behind a flag, outside the gate, and only if P0 lands at 25-39%.
- **Ads:** VISION sets a 5-10% continue take-up target. PROTOTYPE excludes ads in P0-P2. Take-up can only be measured after the ad step.
- **Scope:** VISION says friend ghosts "come next". Decision 001 and PROTOTYPE P1 put link ghosts in P1.
- **Naming:** "Lodge map" reads as a reference to an existing title (nice-to-have to rename).

## Answers to questions addressed to me
1. **Does P1's URL-hash challenge match 005's intent?** Mostly yes. Sharing and racing are one action, and the ghost is re-simulated from the seed, so the race is honest without a server. Gaps:
   - Do not encode the score. The recipient's client recomputes it from the inputs, because a score in text can be forged.
   - A link opened after the UTC day rolls over plays the linked seed (the seed is a pure function of date, so no archive is needed), then offers today's course.
   - A simVersion mismatch shows "this wake is from an older version", not a crash.
   - The 3-ghost "Sea" panel and the top-wake and near-score ghosts are dropped. They need a server, so P1 out-list should say so.
   - The 005 wake card is not in scope. VISION bans generated images, so share is text plus link, and the wake is shown live on arrival.
2. **Share and challenge targets for P1:**
   - Challenge open to played run: go 25% or more, iterate 15-24%, kill under 15% after one round.
   - Share rate (copy or native share invoked): 3-5% of sessions (VISION), kill under 1%. Per finished run: go 5% or more, iterate 2-4%.
   - Report challenged-arrival second-run rate separately from organic. It will run higher, so keep it out of the 40% gate.
   - A controlled tester link does not measure virality. Report challenge opens per share (target 0.5 or more) only in the soft launch.
   - n of about 30 is directional only. Say so in the Go line.

## Requested edits
Format: file → section → change [must / nice-to-have]

1. PROTOTYPE.md → Section 2, P1 In → challenge link carries seedId, simVersion, and inputs only, never the score; recipient recomputes. [must]
2. PROTOTYPE.md → Section 2, P1 → add challenge-arrival rules: play linked seed; past-date links play once, then offer today; version mismatch shows a notice. [must]
3. PROTOTYPE.md → Section 2, P1 Metrics and Go → add the share and challenge thresholds in answer 2; split challenged-arrival second-run rate out of the 40% gate. [must]
4. PROTOTYPE.md → Section 3, Input → define tap (discrete nudge) vs hold; map desktop mouse to click on left or right half; drop Space or give it a side. [must]
5. PROTOTYPE.md → Section 2, P2 In and Metrics → remove the map image or the "map-image share rate" metric until VISION permits generated images. [must]
6. VISION.md → Core loop → use the same input rule as PROTOTYPE section 3. [must]
7. VISION.md → First-session journey → add: a challenged arrival sees the challenger's wake from run 1, with no title screen. [must]
8. VISION.md → Success metrics → define share rate per session and per finished run; add challenge conversion; set second-run kill to 30% with the 40% gate. [must]
9. VISION.md → Design pillar 1 → reconcile with PROTOTYPE's optional choice flag, or state the choice is a post-gate item. Coordinate with PO-Design. [must]
10. VISION.md → Non-goals and scope → state that link ghosts ship in P1, matching decision 001. [must]
11. PROTOTYPE.md → Section 3, Analytics → define share_click (copy or native share), add seedId to challenge_open, and add arrival_type (organic or challenge) to run_start. [must]
12. PROTOTYPE.md → Section 5, Risks → add: link previews and portal iframes may strip the hash; test in WhatsApp, iMessage, Discord, and each portal embed before P1. [must]
13. VISION.md → Success metrics → use "p50 60 and p5 50 or more" wording for FPS. [nice-to-have]
14. VISION.md → First-session, 2 min → say "best run" or "last run" and state same-seed only. [nice-to-have]
15. PROTOTYPE.md → Sections 2 and 3 → rename "Lodge map" to a neutral internal name. [nice-to-have]

Summary: both docs approve with changes. Must-haves are 1-12 (mostly PROTOTYPE input, challenge, and share rules, plus VISION controls and metrics). Item 9 needs PO-Design's agreement.
- PO-Social
