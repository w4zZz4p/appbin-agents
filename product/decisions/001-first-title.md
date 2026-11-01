# Decision 001: First title — Driftline merged with Tidewake ghosts and Lantern Descent's map

- Date: 2026-11-01
- Outcome: **accepted** — build a merged one-input river game, with 007 Driftline as the base
- Participants: PO-Design, PO-Player, PO-Social, PO-Tech
- Inputs: proposals 001–008, reviews in `product/reviews/`
- Assumptions (not yet confirmed by the user): solo-fun core with social as a layer; only
  opt-in rewarded ads plus cosmetics; genre left open

## Votes (ranked top 3, 3/2/1 points; max one own concept each)

| Concept | PO-Design | PO-Player | PO-Social | PO-Tech | Points |
|---|---|---|---|---|---|
| 007 Driftline | 3 | 3 | – ¹ | 3 | **9** |
| 003 Lantern Descent | 2 | 1 (own) | 2 | 2 | **7** |
| 005 Tidewake | 1 | – | 3 (own) | – ² | **4** |
| 008 Knotwork | – | 2 | – | – | 2 |
| 001 Plume | – | – | 1 | 1 | 2 |
| 002, 004, 006 | – | – | – | – | 0 |

¹ PO-Social folded Driftline into Tidewake rather than voting for it separately.
² PO-Tech's #1 was "Driftline with Tidewake's ghost layer merged in".

003 Lantern Descent is the only concept that every PO put in their top 3.

## Shared RICE (R×I×C/E, effort in person-months to public MVP)

| Concept | Design | Player | Social | Tech | Mean |
|---|---|---|---|---|---|
| 007 Driftline | 0.42 | 0.96 | 0.48 | 0.72 | **0.65** |
| 001 Plume | 0.40 | 0.47 | 0.53 | 0.47 | 0.47 |
| 003 Lantern Descent | 0.40 | 0.32 | 0.53 | 0.38 | 0.41 |
| 008 Knotwork | 0.40 | 0.40 | 0.45 | 0.40 | 0.41 |
| 005 Tidewake | 0.33 | 0.30 | 0.56 | 0.35 | 0.39 |
| 004 Courier Regulars | 0.11 | 0.10 | 0.15 | 0.13 | 0.12 |
| 002 Hindsight | 0.07 | 0.06 | 0.06 | 0.08 | 0.07 |
| 006 Whisper Chain | 0.04 | 0.05 | 0.07 | 0.12 | 0.07 |

## What we're building

- **Core (007 Driftline):** one-thumb paper boat on a procedural river that narrows and
  speeds up. No menu before the first run, Canvas 2D, about 250 KB initial load, daily
  seed from the date, no server in v1.
- **Social layer (005 Tidewake):** each run leaves a ghost wake. v1 races your own last
  run locally; friend ghosts are shared through the link or URL. Server-side
  re-simulation and leaderboards come later (PO-Tech estimate: under $10/month).
- **Retention layer (003 Lantern Descent):** each run lights one stretch of a persistent
  river map, so even a first failed run shows progress.
- **Monetization:** one opt-in rewarded continue per run, plus cosmetic boats and wakes.

## Key reasoning

- Strongest first 30 seconds of the set: one input, instant play, tiny download.
- Cheapest base (about 1 person-month) and deterministic, which the ghosts and daily
  seed need anyway.
- Three of the concepts were all one-input river/glide games; merging them keeps the best
  parts without building three games.

## Dissent

- **PO-Social** wanted 005 Tidewake (timed gates on a shared daily course) as the base, with
  Driftline as an endless mode. Resolution: Tidewake's gates are a candidate daily-mode
  variant, to be tested after the core prototype.
- **PO-Design** flagged one-button saturation risk. Plume's wind zones are kept as a
  post-MVP modifier to add depth.

## Not chosen

- **008 Knotwork:** deferred. Puzzle fallback if the user prefers a calm puzzle genre.
- **001 Plume:** deferred. Wind zones may be reused as a river modifier.
- **002 Hindsight:** rejected for the first title. First fun takes too long for portals, and
  it needs a determinism spike first (integer-only simulation plus a cross-browser hash test).
- **004 Courier Regulars:** rejected for the first title. High content cost for a small D1 lift.
- **006 Whisper Chain:** rejected for the first title. Cold start, plus moderation of drawings
  and text.

## Follow-ups

1. User to confirm the three assumptions above, or change them, before VISION.md is filled in.
2. Fill in `product/VISION.md` for the merged concept.
3. Build the smallest playable test: one river, daily seed, local ghost, no map. Use 007's
   kill criteria. Gate: at least 40% of players start a second run within 5 minutes
   (from 005).
4. Second prototype step: add the persistent map and measure the D1 lift.
5. Set the 1.5 MB total and 300 KB audio budget as the platform standard (PO-Tech).
