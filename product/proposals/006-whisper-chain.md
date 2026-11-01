# 006: Whisper Chain (async drawing-and-guessing telephone)
- Author: PO-Social
- Status: proposed
- Focus: social, virality & multiplayer

**Pitch:** A quick, asynchronous chain game where a phrase is drawn, guessed, and passed along by strangers or friends. The reveal of how the message drifted is the thing people screenshot and share.

**Core fantasy:** Being the funny link in a chain that everyone is watching fall apart, and being the one who saw it coming.

**30-second core loop:** You get the previous player's step: either a phrase to draw (20 s, limited stroke ink) or a drawing to name (15 s, one text box). Submit. Your step joins the chain and you see how the chain looks so far. Each chain has 6 steps, so one round is about 2 minutes and is over before you tire of it.

## Player problem / opportunity
- Party games need several people in one room or a live match, which breaks instant play and solo visits.
- Async "telephone" games create shareable, funny artifacts, but most require accounts and waiting for friends.
- Assumption: a turn that takes 15-20 seconds with a playable solo start can be fun on first visit, and the drift reveal drives sharing.

## Proposed feature
1. Land: either "Continue a chain" (a waiting chain from a link) or "Start a chain" (new phrase). A new visitor with no waiting chain is dropped into an archived chain at a random step, so the first turn is instant.
2. Turn: phrase step = draw it with finger or mouse, 20 s, stroke-limited. Drawing step = type a guess, 15 s. Skip is allowed, but skipping is logged to avoid griefing.
3. Chain complete: flip-book reveal of all steps, side by side, with the phrase drift highlighted.
4. Share: reveal card (image) and a link to the full chain. "Start a chain from my phrase" invites the next player.
5. Archive: completed chains are kept and become the filler for solo visitors and stalled chains.
6. Light reaction: one "funniest drift" tap per chain; a daily top-chain page.
- Core loop touch: each turn is the same 15-20 second action; the reveal is the reward and the share hook.

## Platform notes
- Mobile: drawing via pointer events, large touch area, portrait canvas; text entry with the native keyboard. Desktop: mouse drawing and keyboard typing.
- Load: drawings as compressed stroke arrays (2-5 KB per step). Initial bundle under 500 KB.
- Needs a backend for chains, archive and turn assignment (simple key-value store plus a cron for stale chains).
- Stalled chains auto-advance with an archived step after 24 h, so nobody waits forever.
- Local storage only for a "your chains" list; losing it is acceptable.

## Value & metrics
- Chain completion rate for solo-started chains: 50%+ (the cold-start metric).
- Share rate of reveal cards: 15% of completed chains.
- D1 return to see a chain update: target 30% of starters.
- Session length: 3-6 minutes, 2-3 chains per session.
- Invite conversion: 1 in 4 "start a chain" invites produces a completed step.

## Effort & risks
- Effort: M-L (about 6-8 person-weeks; the moderation and backend cost is the main unknown).
- Content: a curated, original prompt bank (about 300 phrases, all-ages, no brands or existing characters).
- Risks: toxic or sexual drawings and text (keyword filter, report button, human review of reported steps, no free-text names); abandoned chains (auto-advance); low-effort spam (minimum stroke count); prompt bank drift toward cliches.
- Originality: async chain with archive dropping and a drift reveal is the distinct hook; avoid copying live-room drawing-guess formats.

**RICE (assumed inputs):** Reach 25k players/month, Impact 1.5 (social hook is strong but depends on moderation), Confidence 50%, Effort 7 person-weeks. Score = 25000 x 1.5 x 0.5 / 7 = 2679.

## Smallest playable test
- Two-week prototype: one page, 2-step chain (draw, then guess), 50 hand-made archived chains for cold start, no accounts, shareable reveal image.
- Test with ~40 players via a link: does a solo visitor finish a step within 60 seconds, and do 15%+ of reveals get shared?
- Kill criterion: fewer than 30% of solo starts complete the first step, or the reveal is not rated funny by at least half of testers.

## Review
<!-- Other POs append here: -->
<!-- - **PO-Name** (support | concerns | oppose): reason -->
