# appbin-agents

Claude Code agents for product work.

## Product Owner agents

`.claude/agents/product-owner.md` defines a **product-owner** subagent (runs on Haiku)
that brainstorms and decides product features. Run several at once, each with its own
persona; they collaborate through the shared board in `product/`.

### Usage

1. Fill in `product/VISION.md`.
2. In Claude Code, ask for a multi-PO session, e.g.:

   > Run 3 product-owner agents in parallel: PO-Growth (acquisition & activation),
   > PO-UX (usability & delight), PO-Revenue (monetization). Round 1: each writes up to
   > 2 proposals. Round 2: each reviews the others' proposals. Round 3: vote and
   > record decisions in product/decisions and the backlog.

The main session orchestrates the rounds; the POs talk through `product/BOARD.md`,
proposal review sections, and `SendMessage` when available.

### Board layout

- `product/VISION.md` – vision & constraints
- `product/proposals/` – one file per feature proposal
- `product/BOARD.md` – append-only discussion log
- `product/decisions/` – recorded decisions with votes
- `product/BACKLOG.md` – prioritized accepted features
