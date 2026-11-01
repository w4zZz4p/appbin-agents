# Round 2 review: PO-Player (player experience, onboarding & retention)

Assumptions (user has not decided yet): solo-fun core with social as a layer; only rewarded/opt-in ads plus cosmetics; genre (action vs puzzle) open.

## 1. Reviews

### 001 Plume: concerns
- Strong 30-second read: hold/release is learnable and the restart loop fits short sessions.
- Wind zones and seed types are the only differentiators from other one-button flyers. Unproven.
- Scope creep: 3 zones, 3 seed types, replay and Daily Wind are M effort before the single-zone test has passed.
- Improvement: ship only the single-zone test. Add Daily Wind after the 3-runs-per-session gate is met. Consider merging into the 007 river (see section 3).

### 002 Hindsight: concerns
- Design is the most original here. The ghost-blocks-plate rule is a real "aha" for planners.
- Fails the portal test: time to first fun is 3 minutes and Reach is about 0.3. Most portal players leave before the ghost rule clicks.
- Level authoring (30 rooms) is the budget driver and the determinism requirement is high risk.
- Improvement: cap the public MVP at 5 rooms with a 60-second onboarding room (one plate, one ghost). Make the 1-room daily solve code the retention unit.

### 005 Tidewake: support (conditional on merge)
- Ghost wakes give "same course, my line" competition without real-time servers. This is the best social hook in the set.
- Overlaps heavily with 007 (one-input boat, daily seed). Two boat games in the same slot will cannibalise each other.
- Gates on a shared clock and a crash checkpoint add complexity the 1-week test does not need.
- Improvement: fold the ghost wake and the 3-ghost panel into 007 as its social layer. Drop gates and tide modifiers until v2.

### 006 Whisper Chain: oppose (for the next public MVP)
- The reveal is funny and shareable. That is a real asset.
- Cold start is the core problem. A solo visitor must see a useful step in 30 seconds, and the design depends on a waiting-chain backend, moderation and about 50 curated chains.
- Drawing on mobile in portrait and a 15-20 second turn with no payoff until the reveal is weak for first-session retention.
- Kill-test threshold (30% of solo starts complete step 1) is unlikely to be met without a bigger archive.
- Improvement: revisit as a v2 social mode once a single-player game has D1 data. Prototype only the reveal card with archived chains, no backend.

### 007 Driftline: support (my pick for the base)
- Best first-30-seconds profile in the set: no menu, first lantern in 5 seconds, one input.
- Tiny load and client-side daily seed fit portal play with no backend.
- Weakness: a daily seed alone is a thin D1 hook. It needs a persistent layer.
- Improvement: add the 003 lit-map (persistent "reaches" map) and the 005 ghost wake as the retention and social layers. Keep the passable-lane guarantee and the one-continue-per-run ad cap.

### 008 Knotwork: support (with concerns)
- Lowest effort and best device profile (near-zero idle CPU, under 150 KB). Ideal for a spare tab.
- Daily knot plus streak is a proven D1 ritual. It also widens the genre mix beyond action.
- Concerns: a generic planarity genre with a low ceiling, so "one more" weakens after 6-12 knots. Streak pressure can become a guilt mechanic.
- Improvement: add a forgiveness rule (one missed day keeps the streak) so the retention hook is not manipulative. Use the 003 map idea for a monthly view of solved knots.

## 2. Shared RICE (common scale)

Reach = share of browser-portal players who try it and get it within 30 s. Impact: 0.5 / 1 / 2 / 3. Confidence 0-1. Effort = person-months to public MVP (small team). Score = R x I x C / E.

| Rank | # | Concept | Reach | Impact | Conf. | Effort (pm) | Score |
|---|---|---|---|---|---|---|---|
| 1 | 007 | Driftline | 0.8 | 2 | 0.6 | 1.0 | 0.96 |
| 2 | 001 | Plume | 0.7 | 2 | 0.5 | 1.5 | 0.47 |
| 3 | 008 | Knotwork | 0.6 | 1 | 0.5 | 0.75 | 0.40 |
| 4 | 003 | Lantern Descent | 0.8 | 2 | 0.5 | 2.5 | 0.32 |
| 5 | 005 | Tidewake | 0.6 | 2 | 0.5 | 2.0 | 0.30 |
| 6 | 004 | Courier Regulars | 0.5 | 1 | 0.5 | 2.5 | 0.10 |
| 7 | 002 | Hindsight | 0.3 | 2 | 0.4 | 4.0 | 0.06 |
| 8 | 006 | Whisper Chain | 0.4 | 1 | 0.3 | 2.5 | 0.05 |

Notes: Effort is my estimate from each proposal's stated size (S/M/L and person-weeks), converted to person-months. Impact is the fun-plus-D1 rating, so a single 0.5 step is a judgement call.

## 3. Merge ideas

- **Driftline (007) + Tidewake ghosts (005):** one boat/river game. The daily seed is the base, and the ghost wake plus 3-ghost panel is the social layer. Gates are dropped. This is one concept, not two.
- **Driftline (007) + Lantern lit map (003) + Plume wind (001):** one-input family. 007 is the base. Plume's wind zones become river current. Lantern's lit map becomes the persistent meta layer. Three one-input glide games should not ship as three products.
- **Knotwork daily streak (008) as a template:** the daily-seed-plus-streak layer can be reused by whichever base wins, so it does not need its own concept.
- **Hindsight (002) solve codes and Whisper Chain (006) reveal card:** both are share artifacts. Pick one share-card format for the whole portfolio.

## 4. Vote

1. **007 Driftline (3 pts)**: it is the only concept that is instant on a portal, tiny to load and ready for a daily seed, and it can absorb the 005 ghosts and 003 map.
2. **008 Knotwork (2 pts)**: it gives a different genre (puzzle) with the cheapest MVP and a retention ritual, which keeps the portfolio from being all one-input action.
3. **003 Lantern Descent (1 pt, my own)**: the persistent lit map is the strongest D1 hook I have seen, and it is the layer I would add to 007.

Merged-concept votes: vote 1 counts for 007 with 005 and 001 merged in. Vote 3 counts for 003 only (not merged).
