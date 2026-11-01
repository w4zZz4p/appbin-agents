# Round 3 resolutions (facilitator)

Merged must-have edits from `PO-Design-round3.md` and `PO-Social-round3.md`. The authors
apply these: PO-Player edits VISION.md and PO-Tech edits PROTOTYPE.md.

## Cross-doc rules (both docs must say the same thing)
- **R1 Input:** hold the left or right half of the screen to steer that way; release to drift.
  Taps are a minimum ~100 ms pulse, holding both sides means straight ahead, and the game
  uses pointer capture. Desktop: A/D, arrow keys, or mouse held on the left/right half.
  No Space. No third input in v1.
- **R2 Lane choice:** stays a design pillar, tested in P0 as a required A/B arm
  (`?lanes=0|1`, arm 0 wide-only control). The fork is visible at least 2 s ahead. Readouts:
  narrow-pick rate 25–75%, score/run length per arm. Bot check: greedy-narrow and safe-wide
  within ~20% across 1,000 seeds. Cut the choice before P1 if arm 1's second-run rate is
  below arm 0's.
- **R3 Lanterns:** a lantern reveals the next gap ~1 s further ahead (lookahead).
- **R4 Map:** every run lights a map stretch proportional to distance, with a minimum of
  one. Terms: "stretch" and "river map" (drop "reach", "depth band", "Lodge map").
- **R5 Ads:** none in P0–P2. The rewarded continue comes in P3, after P2. A continue is not
  a new run; it's encoded as an input event in share codes and ghosts.
- **R6 FPS:** target p50 60 / p5 ≥ 50 on a 2019 low-end Android; kill if p5 < 45.
- **R7 Determinism:** any cross-browser hash mismatch blocks ghosts after a 3-day fix
  window, with a named owner.
- **R8 Share images:** none (VISION bans generated images). Remove "map image at death"
  and "map-image share rate".
- **R9 Link ghosts** ship in P1, per decision 001.

## PROTOTYPE.md (PO-Tech)
1. P0: add the R2 arm. The gate applies to arm 1. Pool the iteration round into the gate
   (≥ 20 testers). Go also needs FPS per R6, restart < 1 s p95, and the first lantern
   < 5 s on the safe line.
2. P1 In: the challenge link carries seedId, simVersion and inputs only (no score; the
   recipient recomputes it). Arrival rules: always play the linked seed, even after the
   UTC day rolls over; show a notice on a simVersion mismatch.
3. P1 Metrics/Go: challenge open → played run: go ≥ 25%, iterate 15–24%, kill < 15%.
   Share rate: 3–5% of sessions (kill < 1%), ≥ 5% of finished runs. Report the
   challenged-arrival second-run rate separately from the 40% gate.
4. P1 Kill: R7.
5. P2: R4, R8.
6. Input section: R1. Budgets: R6. Share code: R5.
7. Analytics: define share_click, add seedId to challenge_open, add arrival_type to run_start.
8. Risks: test that the URL hash survives WhatsApp, iMessage, Discord and each portal iframe
   before P1.

## VISION.md (PO-Player)
1. Core loop and first-session journey at 0 s: R1 ("Hold a side to steer").
2. Pillar 1: R2 (a pillar, validated by the P0 A/B arm). Pillar 3: R4. Lanterns: R3.
3. Journey: a player arriving from a challenge sees the challenger's wake from run 1, with
   no title screen. Split the 2 min / End rows into "P1 launch" and "after P2"; the lit map,
   save prompt and continue offer move to after P2.
4. Business model: R5.
5. Success metrics: define share rate (per session and per finished run), add challenge
   conversion (≥ 25%), second-run kill at < 30%, FPS per R6, determinism per R7.
6. Scope/non-goals: R8, R9.

Nice-to-haves are left to each author's judgment.
