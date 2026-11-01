# appbin-agents

Claude Code agents for product work.

## Product Owner agents

`.claude/agents/product-owner.md` defines a **product-owner** subagent (runs on Haiku)
that brainstorms and decides features for a **browser game**: mechanics, onboarding,
progression, retention, social features, monetization, and web performance. Run several at once, each with its own
persona; they collaborate through the shared board in `product/`.

### Usage

1. Fill in `product/VISION.md`.
2. In Claude Code, ask for a multi-PO session, e.g.:

   > Run 4 product-owner agents in parallel: PO-Design (core loop & mechanics),
   > PO-Player (onboarding & retention), PO-Social (virality & multiplayer),
   > PO-Tech (performance & mobile browsers). Round 1: each writes up to
   > 2 proposals. Round 2: each reviews the others' proposals. Round 3: vote and
   > record decisions in product/decisions and the backlog.

The main session orchestrates the rounds; the POs talk through `product/BOARD.md`,
proposal review sections, and `SendMessage` when available.

### Board layout

- `product/VISION.md` – game vision (genre, core loop, players, constraints)
- `product/proposals/` – one file per feature proposal
- `product/BOARD.md` – append-only discussion log
- `product/decisions/` – recorded decisions with votes
- `product/BACKLOG.md` – prioritized accepted features
