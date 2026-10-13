# Trade Discipline

Private futures trading journal for MGC and MNQ. Hosted sign-in protects access; D1 records are isolated by signed-in user. No brokerage credentials or trade execution are used.

## Workflow

1. Add each evaluation or funded account. Enter your own starting balance, daily loss limit, and maximum trade risk. These are personal tracking thresholds, not a representation of a firm's current rules.
2. Use the entry checklist and planned prices before placing a trade in your trading platform. Supply/demand and bias checks are self-reported; the app does not receive chart data.
3. Log the closed trade, original stop, target, quantity, and total round-trip fees. For copied entries, select the receiving accounts. Review each account's actual fill and fees afterward.
4. Review the PnL calendar and weekly review. Account results describe account executions; grouped strategy results consolidate copied decisions.
5. Save the weekly reflection and export backups periodically.

## Calculation boundaries

MGC is $10 per point per contract (0.1 tick); MNQ is $2 per point per contract (0.25 tick). Net PnL subtracts total fees entered. R uses the original entry-to-stop price risk. Daily/account calculations use the chosen trading date, which can be different from the entry's calendar date for overnight futures sessions. This is a closed-trade journal, not live unrealized PnL or broker-enforced risk control.

Expectancy is average net result per observation. Profit factor compares net winning results to absolute net losing results. Results with no losses do not imply a reliable infinite edge. Copied fills are correlated; strategy grouping prevents counting each account as an independent decision. Small samples and observational checklist differences do not establish causation.

## Sessions and journal

Default kill-zone windows are editable conventions in America/New_York: Asia 20:00–00:00, London 02:00–05:00, New York 07:00–10:00. They are not exchange market-hours calendars or holiday checks. DST is handled by the browser's IANA timezone support.

Voice dictation uses browser speech recognition when available. The browser may process audio through its provider. Typed entry remains available. Formatting organizes journal text into a template; it is not a connected generative-AI service.

## Integrations

Topstep, Lucid, Tradeify, and other firm names organize manually entered accounts. The application does not connect to or place orders through them or TradeSyncer. Copy groups record a shared decision across accounts; they do not copy trades at a broker.

## Development

Use the generated Sites/Vinext workflow and package scripts. Schema lives in db/schema.ts and changes use appended Drizzle migrations. Never create tables in request handlers. The state API requires hosted identity and optimistic revision checks to prevent stale tabs overwriting a newer save.

## Contract references

- CME Micro E-mini Nasdaq-100: https://www.cmegroup.com/markets/equities/nasdaq/micro-e-mini-nasdaq-100.contractSpecs.html
- CME gold contract comparison (Micro Gold): https://www.cmegroup.com/markets/metals/files/1-oz-futures-comparison.pdf
