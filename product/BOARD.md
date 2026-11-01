# Discussion Board

Append-only log of PO discussion. Newest entries at the bottom.

### 2026-11-01 Facilitator — Round 1: concepts
Eight original game concepts were proposed: 001 Plume, 002 Hindsight (PO-Design); 003 Lantern
Descent, 004 Courier Regulars (PO-Player); 005 Tidewake, 006 Whisper Chain (PO-Social); 007
Driftline, 008 Knotwork (PO-Tech). See `proposals/`.

### 2026-11-01 Facilitator — Round 2: reviews and vote
All four POs reviewed the concepts, re-scored them on a shared RICE scale and voted (see
`reviews/`). Result: 007 Driftline 9 pts, 003 Lantern Descent 7, 005 Tidewake 4. Accepted a
merged first title, with Driftline as the base, Tidewake's ghosts and Lantern Descent's map.
PO-Social dissented on the base. See [decision 001](decisions/001-first-title.md).

### 2026-11-01 Facilitator — Round 3: vision and prototype plan
PO-Player drafted `VISION.md` and PO-Tech drafted `PROTOTYPE.md`. PO-Design and PO-Social
reviewed them (both "approve with changes"). Conflicts were resolved in
`reviews/round3-resolutions.md`. Input is now hold-a-side-to-steer, and the lane choice is a
required P0 A/B arm. Both authors applied the edits; the docs are consistent.
Waiting on the user: PROTOTYPE open questions (hosting/analytics owner, tester source, EU
consent, 2019 Android test device, target portal and its break rules).

### 2026-11-01 Facilitator — P0 build ready for playtest
The P0 feel test is built in `game/` (see `game/README.md`). Automated gates pass:
1,000/1,000 seeds are passable on both arms, the first lantern arrives at 2.5 s, restart
takes 4–12 ms, and the bot lane balance ratio is 0.80–0.95. Remaining gates need people
and a device: the second-run rate, session length and fairness from 20+ testers, and
FPS on a 2019 Android. Tuning: narrow channel 72 units with 6 lanterns, so the narrow
lane pays off for skilled play and costs weaker play.

### 2026-11-01 Facilitator — P1 build ready
P1 is live on the same Pages URL. It has the daily UTC river, a last-run ghost, "Challenge
a friend" links (seed, version and inputs only, about 260 characters at most for 90 s),
and the arrival rules from PROTOTYPE §2. The P1 events are logged, and a cross-browser
golden-hash job (Chromium, Firefox, WebKit) is in CI. Open items:
- A beacon endpoint for remote analytics (open question 1).
- Checking that links survive WhatsApp, iMessage, Discord and portal iframes.
- A real Android golden check.
- The P0 lane decision. The arm stays in until P0 playtest data arrives; challenge links
  carry the arm so replays stay exact.
