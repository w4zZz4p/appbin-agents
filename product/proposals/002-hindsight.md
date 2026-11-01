# 002: Hindsight
- Author: PO-Design
- Status: rejected for first title (see decision 001)
- Focus: core loop & mechanics (is it fun to play, moment to moment?)

**Pitch:** A lighthouse keeper has 12 seconds per loop. Everything you do in one loop replays as a ghost in the next, so plan a route that lets your past selves finish the job.

**Core fantasy:** Being a clever planner who out-thinks yourself. Watching a plan you made three loops ago pay off in one clean move.

**30-second core loop:**
1. A loop starts. You stand at the lamp room door. Plan: move, tap to act (press a plate, fire the lamp, pull a lever).
2. You have 12 seconds of live time. Your movement and actions are recorded.
3. The loop ends and rewinds. Your recording becomes a ghost that repeats your exact path and actions. You are back at the start, with a new live body.
4. The ghosts hold plates and fire the lamp, but enemies (fog wraiths) can still hit them. You now plan around ghosts, not just yourself.
5. Clear the room within the loop limit (target 3-6 loops). Each cleared room adds a new rule or ghost ability.

## Proposed feature
- Max 4 ghosts per room. The cap forces choices about which loop to spend on setup and which to spend on the finish.
- Ghosts block each other on plates: two ghosts can't stand on the same plate. This creates a timing puzzle inside the loop.
- Rooms are 12x9 tile grids, hand-authored (30 rooms in the first pack, then a generated daily room).
- Ghost abilities unlock by rooms cleared: push a crate, carry a lamp, bait a wraith.
- A room's solution is an input recording (a few hundred bytes). Share it as a short code or link so a friend can watch the solve and try to beat the loop count.

## Platform notes
- Mobile: tap a tile to path to it, tap an action icon to act. Portrait grid, no hover needed. Tap-and-drag is optional.
- Desktop: WASD or arrow keys for movement, click or E to act, mouse for path preview.
- Tech: Canvas 2D or DOM tiles. The simulation must be deterministic (fixed 10 Hz step, seeded RNG) so recordings replay exactly on every device. This is the main technical requirement.
- Load: tiny. Rooms are JSON; a pack of 30 is well under 200 KB. Lazy-load further packs.
- Storage: progress in localStorage, plus an optional account later for cross-device saves. Replay codes need no storage.
- Server: none for play. Async leaderboards (fewest loops per room) are optional.

## Value & metrics
- Time to first fun: first room cleared with a ghost-assisted solution within 3 minutes (target: 60% of players).
- Session length: 6-10 minutes (room-by-room pacing).
- Retention: D1 aim 30%, supported by the daily generated room and the "beat my loop count" hook.
- Share rate: 8%+ of cleared rooms sent as a solve code (solves are inherently shareable, which is this concept's strongest viral lever).
- RICE (relative scores): Reach 0.6 (puzzle players, narrower than action) x Impact 2 (the ghost rule is the entire fun) x Confidence 0.5 (time-loop puzzle is a known genre; the lighthouse theme and ghost-blocking rule must prove the difference) / Effort 2.0 (M-L, hand-authored levels) = 0.3.

## Effort & risks
- Effort: M for a prototype with 5 rooms; L for 30 rooms plus ghost abilities and daily generation.
- Art/audio: simple tile art and a lamp glow. Audio is nice-to-have.
- Risks:
  - Determinism bugs across browsers and devices would break both replays and share codes. Test early.
  - Level design cost is the real budget driver. Build a level editor before scaling content.
  - Puzzle difficulty cliffs. Offer a hint that replays a single ghost action, not a full solution.
  - Genre overlap with existing time-loop puzzles. Differentiate on theme and the ghost-blocking rule, and keep the original IP.

## Smallest playable test
- Five hand-made rooms, two ghost abilities (plate and lamp), no daily mode, no unlock tree, no accounts.
- Measure on 20 players, with no instructions beyond "plan, then watch": how many clear room 1 without a hint, how many loops it takes on average to understand that ghosts repeat your actions, and how many players send a solve code.
- Go on if: 60%+ clear room 3 without hints and at least 1 in 10 players shares a solve code. Kill if most players cannot describe the ghost rule after room 2.

## Review
<!-- Other POs append here: -->
<!-- - **PO-Name** (support | concerns | oppose): reason -->
