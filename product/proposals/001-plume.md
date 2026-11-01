# 001: Plume
- Author: PO-Design
- Status: proposed
- Focus: core loop & mechanics (is it fun to play, moment to moment?)

**Pitch:** You are a dandelion seed. Hold to puff yourself higher, release to drift, and thread the wind currents for as long as you can.

**Core fantasy:** Being light, fragile and carried by the air, and mastering the pump-and-glide rhythm to go further than the wind should allow.

**30-second core loop:**
1. Seed starts on the ground at the left edge. Hold the button to puff: it rises, and a puff meter drains.
2. Release to glide: the seed falls slowly and drifts right. Glide distance scales with the altitude you still have.
3. Gold motes float on updrafts. Fly through them to gain points and refill the puff meter. Crows and rain gusts push you down.
4. Each pump-glide cycle is a decision: spend energy now for height, or wait for a mote-lit updraft. Run ends on ground contact or a crow hit.
5. A run lasts 1-3 minutes. Restart is one tap, so the next run is always about 3 seconds away.

## Proposed feature
- Single input: hold = puff, release = glide. No text, no tutorial beyond the first 10 seconds of motes.
- Wind zones change every ~20 seconds (calm, gusty, storm). Zones are readable from color and particle drift, so players learn them by watching.
- Seed types unlock from lifetime distance (for example: heavier seed with stronger puff, light seed with longer glide). Unlocks change the feel, not the power ceiling.
- Daily Wind: every player gets the same wind map for 24 hours, with a distance leaderboard.
- Share: a run ends on a short ghost replay (about 5 seconds) that can be sent as a link or record.

## Platform notes
- Mobile: press-and-hold anywhere on the screen. Portrait works. Input latency must stay under 100 ms, so hold detection must not wait for a frame callback.
- Desktop: Space, mouse button or tap. Same mechanic, no mode switch.
- Tech: Canvas 2D, vector-style sprites, no audio required for the core loop (audio optional). Target initial load under 1 MB.
- Storage: best distance and unlocks in localStorage. Losing them is annoying but not fatal.
- Server: only for the Daily Wind leaderboard (optional at first; can start as a local ranking).

## Value & metrics
- Time to first fun: first puff-glide chain of 3+ cycles within 30 seconds (target: 80% of players).
- Session length: 4-6 minutes average (many short runs).
- Retention: restart-within-3-seconds loop should drive runs per session above 6.
- Share rate: 5%+ of runs end on a share action once the replay is good.
- RICE (relative scores): Reach 0.9 (single-input, universal) x Impact 2 (core loop is the whole game) x Confidence 0.6 (one-button market is crowded) / Effort 1.0 (small) = 1.1.

## Effort & risks
- Effort: S for the prototype, M for the full set (3 wind zones, 3 seed types, replay, Daily Wind).
- Art/audio: minimal vector art; a soft wind loop is a big mood lever.
- Risks:
  - Saturation: one-button flyers are common. Differentiation must come from wind zones and the seed-type feel, not the input.
  - Mobile hold timing feels mushy if the puff curve is too linear. Tune the curve before adding content.
  - Difficulty cliff in storm zones. Use a visible energy floor so it never feels like an unfair cheap death.
  - Ad fatigue: rewarded "continue from 100 m" is the only ad slot we'd propose.

## Smallest playable test
- One screen, one wind zone, motes and crows only, no unlocks, no leaderboard.
- Measure on 30 players from a single link: median runs per 5-minute session, share of players reaching a 3-cycle chain in the first 30 seconds, and whether they can explain the puff/glide rule after 1 minute without being told.
- Go on if: 3+ runs per session on median and 70%+ hit a 3-cycle chain. Kill or redesign if players quit after one crash without retrying.

## Review
<!-- Other POs append here: -->
<!-- - **PO-Name** (support | concerns | oppose): reason -->
