# Working on Session / Trade Discipline

## Goal
Build a private MGC/MNQ futures journal with account PnL calendars, always-visible NY-time kill zones, a pre-entry confluence checklist, dictation, and evidence-based weekly reviews.

## Agent workflow
The user explicitly requests multiple implementation agents and an independent review before delivery. Divide ownership into frontend, analytics, and persistence/integrations. Have an independent reviewer inspect the final changes. Avoid simultaneous edits to the same files. The coordinating agent owns builds, integration, and publication.

## Commands
- `npm run install:ci` — install dependencies with the supplied runtime-aware installer.
- `npm run dev` — local development server.
- `npm run build` — production build.
- `npm test` — financial math and state validation tests.
- `npm run typecheck` — TypeScript validation.
- `npm run db:generate` — append Drizzle migrations after schema changes.

## Boundaries
- Never place orders, copy trades at a broker, or imply a broker integration exists without implementing and verifying it.
- Keep firm rules configurable. Never hard-code current Topstep/Lucid/Tradeify risk or payout policies without verified sources.
- Do not store credentials in source, logs, client bundles, or test fixtures.
- Keep user data server-isolated; preserve hosted identity checks and optimistic revision locking.
- Do not silently replace cloud data or drop unsaved drafts after failed saves.
- Empty real accounts are the default. Any future demo mode must be visibly separate from actual records.

## Financial correctness
- MGC: $10 per point, 0.1 tick. MNQ: $2 per point, 0.25 tick.
- Net PnL subtracts total round-trip fees once per account execution.
- Original price-to-stop risk is the R denominator; wrong-side/zero stops yield unavailable R, not infinity.
- Account executions and independent copied decisions are different sample sizes.
- Breakevens belong in expectancy denominators; handle zero wins/losses explicitly.
- Closed-trade drawdown is not intraday equity drawdown or a prop-firm trailing-loss rule.
- Kill zones use America/New_York with DST and editable start-inclusive/end-exclusive windows. Overnight windows cross midnight.
- User-selected futures trading date is authoritative; do not reinterpret it as UTC.

## Entry checklist
Bias alignment (15M and 1H) AND correct 15M POI (demand long/supply short) AND correct premium/discount location from prior 1H swing AND (liquidity sweep OR 5M MSS). Permit journaling mistakes; don't rewrite historical checks to make trades compliant.

## Validation
Run relevant tests, typecheck, production build, and independent review. Test real browser flows when a supported browser is available. Never report microphone, hosted storage, or visual checks as passed when only static checks ran.

See PRODUCT.md, docs/ROADMAP.md, and docs/REVIEW.md for scope and remaining work.
