# Day Trading PnL Calendar & Journal

A private MGC/MNQ futures trading workspace for evaluation and funded accounts. The interface is branded **Session**.

## Start here

This repository contains implemented application code, not just a project prompt. Read `AGENTS.md` before making changes; it includes the requested multi-agent implementation and independent-review workflow. Read `PRODUCT.md` for calculation boundaries and `docs/ROADMAP.md` for the next milestones.

### Requirements

- Node.js 22.13 or newer (Node 22.18+ recommended for the native TypeScript tests).
- A package manager supported by the included installer.
- Cloudflare D1 and the supplied Sites/Vinext runtime for authenticated persistence.

```bash
npm run install:ci
npm test
npm run typecheck
npm run dev
```

For a production build:

```bash
npm run build
```

**Authentication note:** local development serves the UI, but its protected journal API requires the hosted ChatGPT identity supplied by Sites. It does not contain an insecure local authentication bypass. Tests for calculations and validation run locally without a connected account. To run full end-to-end development outside Sites, implement a separately configured development identity adapter and local D1 provisioning; never enable a bypass in production. Detailed runtime and migration instructions are in `docs/PLATFORM-SETUP.md`.

## Features

- Multi-account evaluation/funded tracking across Topstep, Lucid, Tradeify and custom firm labels.
- Daily PnL calendar with month/account filtering and individual trade review.
- Manual multi-account copied-trade logging with shared decision IDs.
- Always-visible New York clock, editable Asia/London/New York kill zones, DST support.
- Entry checklist: aligned 15M/1H bias; 15M supply/demand POI; prior 1H swing premium/discount; liquidity sweep **or** 5M MSS.
- Position risk, planned reward/risk, net realized PnL and R, configurable account warnings.
- Browser dictation and editable journal template formatting.
- Weekly account and grouped-decision analytics, rule-based feedback and saved reflections.
- Private cloud records, optimistic concurrency, JSON export/restore and failed-save recovery.

## What is not connected yet

This app does not execute or copy broker trades. Firm names are organizational labels. Live Topstep/TradeSyncer imports, broker APIs, generative-AI journal interpretation, firm-specific trailing drawdown rules, automatic weekly notifications and payouts/cash movements remain future milestones. Voice recognition availability depends on your browser and microphone permission.

## Important calculations

Account PnL and independent trade-decision statistics are intentionally separate. Copied accounts increase portfolio exposure, not independent evidence. Grouped dollar expectancy is portfolio dollars per decision; average R offers a size-normalized view. R is net realized PnL divided by original price-to-stop risk; fees are included in the numerator. All-zero/no-loss/small-sample cases must remain explicit.

## Structure

| Path | Responsibility |
| --- | --- |
| `app/page.tsx`, `app/globals.css` | Trading workspace and responsive interface |
| `app/api/state/route.ts` | Authenticated journal API and revision locking |
| `lib/trading.ts` | Contract math, grouped analytics and NY session helpers |
| `lib/state-validation.ts` | Strict journal schema and referential checks |
| `lib/*.test.mjs` | Financial/date and input-validation tests |
| `db/`, `drizzle/` | D1 schema and versioned migrations |
| `AGENTS.md` | Codex development and review instructions |
| `docs/ROADMAP.md` | Scope, future work and acceptance scenarios |
| `docs/REVIEW.md` | Verified checks and remaining validation limits |

## Put this repository on GitHub

The downloadable package includes an initialized Git repository on branch `main`. Create an empty **private** GitHub repository named `day-trading-pnl-journal`, with no generated README or license. From the extracted project directory:

```bash
git remote add origin https://github.com/YOUR_USERNAME/day-trading-pnl-journal.git
git push -u origin main
```

Use your normal GitHub authentication; do not paste tokens into project files. Then open/connect this repository in your Codex environment and ask it to follow `AGENTS.md`. If you already added a remote, inspect it with `git remote -v` rather than overwriting it blindly.

Suggested first task:

> Read AGENTS.md, PRODUCT.md, docs/ROADMAP.md and docs/REVIEW.md. Use separate agents for implementation and independent review. Start by validating the account → checklist → closed-trade → weekly-review workflow, then add import support only after inspecting a real redacted export.
