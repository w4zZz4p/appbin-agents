# Round 2 review: PO-Social

Assumptions used (VISION.md is still the blank template): solo-fun core with social as a layer; rewarded/opt-in ads and cosmetics only; genre (action vs puzzle) open.

## 1. Reviews

### 001 Plume (PO-Design): support, with concerns
- Single input with a 5-second ghost replay is the right share unit for a 1-3 minute run, and it needs no account.
- Daily Wind leaderboard needs a server. For MVP, a local ranking plus a seed link is enough to test the hook.
- Concern: Plume, 003 and 007 are all hold/steer flyers. Differentiation rests on the wind zones, so it must be proven in playtest, not assumed.
- Improvement: make the share link a playable "beat my wind" ghost on the recipient's device (same seed, their attempt vs. yours). That is a challenge loop, not just a video.

### 002 Hindsight (PO-Design): concerns
- Solve codes are the strongest share mechanic in the set: a few hundred bytes, watchable, and challengeable.
- Fails the 30-second bar. The ghost rule takes 2-3 loops to grasp, and a 3-minute time to first fun will lose most portal visitors.
- Determinism across Android Chrome, Safari and desktop is a hard prerequisite. A bit-identical replay spike must come before any content.
- Reach 0.3 is the narrowest audience in the set.
- Improvement: open with a 15-second auto-played demo of one ghost loop, then the player's first room. Gate content on a 2-day determinism spike across three devices.

### 003 Lantern Descent (PO-Player): support
- Best onboarding in the set: no menu, and death reads as "Reached room 4" plus a lit map, which fixes the 20-second quit problem.
- The Lodge map is a solo retention hook with no server needed. Friend glows are an optional social layer, which fits our assumption.
- The auto-generated map image is a cheap passive share surface.
- Concern: the "save your light" email prompt must stay non-blocking, or it reads as a dark pattern.
- Improvement: use the same compact ghost-path format as Tidewake for the daily shaft. Friend glows can then ship later without a redesign.

### 004 Courier Regulars (PO-Player): concerns
- Character continuity is a real D7 lever, but "Mrs. Adeyemi" pull costs ~120+ lines of writing and ongoing live-ops. That is expensive for a +4-6 pt D1 assumption.
- Social layer is weak: a postcard image of a regular's reply has low reach and no interaction.
- Route puzzles fatigue after ~10 minutes, by its own risk list.
- Improvement: MVP with 2 regulars and one daily set only. Test the "open it again tomorrow?" question at minute 10 before writing more dialogue.

### 007 Driftline (PO-Tech): support as a merge into 005
- Tiny download and a client-side daily seed are exactly the portal-friendly shape. "Beat my 84 on seed #412" is a clean challenge link.
- Concern: Impact 2 is overstated. One-input endless rivers have shallow depth, and a score-only seed challenge is a weak social hook without ghosts.
- Concern: the "passable lane" generator guarantee is valuable and should be shared.
- Improvement: fold Driftline's seeded generator and score challenge into Tidewake as an endless mode, with ghost wakes as the second tier. Adopt its 250 KB budget as the platform standard.

### 008 Knotwork (PO-Tech): support
- Lowest effort with the clearest 30-second read. Zero reading, works offline, near-zero idle CPU.
- Concern: the share is a score comparison with no interaction. Nobody can race a friend's knot.
- Concern: Impact is 1 unless playtests show the settle moment drives D1, not just a daily streak.
- Improvement: show a friend's move count as a ghost target on the same seed (a number to beat, not a replay). Use Knotwork's daily seed and share-code wrapper as the shared template for daily modes.

## 2. Shared RICE re-score (common scale)

Reach = share of portal players who try it and get it within 30 s. Impact: 0.5 low, 1 medium, 2 high, 3 massive. Confidence 0-1. Effort in person-months to public MVP (small team). Score = R x I x C / E.

| # | Concept | Reach | Impact | Conf. | Effort (pm) | Score |
|---|---|---|---|---|---|---|
| 005 | Tidewake (incl. ghost link, small leaderboard) | 0.7 | 2 | 0.6 | 1.5 | **0.56** |
| 001 | Plume | 0.8 | 2 | 0.5 | 1.5 | **0.53** |
| 003 | Lantern Descent | 0.8 | 2 | 0.5 | 1.5 | **0.53** |
| 007 | Driftline | 0.8 | 1 | 0.6 | 1.0 | **0.48** |
| 008 | Knotwork | 0.6 | 1 | 0.6 | 0.8 | **0.45** |
| 004 | Courier Regulars | 0.6 | 1 | 0.5 | 2.0 | **0.15** |
| 006 | Whisper Chain | 0.35 | 1 | 0.4 | 2.0 | **0.07** |
| 002 | Hindsight | 0.3 | 2 | 0.4 | 4.0 | **0.06** |

Scores are close at the top. Confidence and effort differ mainly by playtest evidence, so treat 0.45-0.56 as one tier.

## 3. Merge ideas

- **Group A, one-input steer/climb runs (001, 003, 005, 007):** Tidewake is the base for the social layer. Driftline's seeded generator and score challenge become an endless mode. Plume's wind zones map onto Tidewake's weekly tide modifier. Lantern's Lodge map can be the cross-mode meta layer.
- **Group B, shared daily-seed plumbing (001, 003, 005, 007, 008):** one seed-plus-share-code library (Hindsight's solve-code format, Knotwork's daily wrapper). This is infrastructure, not a game merge, and it cuts effort for every daily mode.
- **006 Whisper Chain** stands alone. Its archived-chain fill for solo visitors is the same pattern as Tidewake's ghosts and could borrow it, but it should not be merged into a steering game.
- **004 Courier and 002 Hindsight** do not merge cleanly. Keep them as separate tests.

## 4. Vote

1. **005 Tidewake (3 pts), own proposal.** It is the only concept where sharing and playing are the same action, and it works solo with a local ghost before any server exists.
2. **003 Lantern Descent (2 pts).** It has the strongest solo-first onboarding and retention hook, and its social layer is optional, so it can ship before any backend.
3. **001 Plume (1 pt).** It has the best moment-to-moment feel in the set, and a 5-second ghost replay is a cheap share unit.

Merged concepts: Driftline (007) is folded into Tidewake (005) and counts toward 005 if the merge is accepted. Knotwork (008) is not in my top 3 but supplies the daily-seed template.
