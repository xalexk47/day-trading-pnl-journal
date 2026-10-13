# Product scope and next milestones

## Implemented foundation
- MGC/MNQ account trade journal; evaluation/funded accounts across configurable firms.
- Monthly daily PnL calendar, account filters, trade edit/delete, account archive.
- Shared decision IDs for manually logged copied executions.
- Sticky NY session clock and editable Asia/London/New York windows.
- Bias/POI/premium-discount/sweep-or-MSS confluence checklist and swing calculator.
- Original risk, planned reward/risk, fees, realized R and account threshold warnings.
- Browser voice dictation and fixed journal formatting template.
- Weekly statistics, rule-based feedback, reflection notes and JSON backup/restore.
- Authenticated D1 storage with user isolation, validation and revision conflicts.

## Next: importing real trading records
Obtain a redacted real Topstep/TradeSyncer CSV export. Specify timezones, fees, fills, partial exits and broker execution IDs before implementing import. Preview mapped records, show duplicates/errors, and require an explicit import action. Do not guess CSV columns or imply automatic synchronization.

## Next: richer journaling
Persist planned trades/checklists before execution, with planned/open/closed states. Add screenshots, optional AI restructuring that preserves the original transcript, session/setup cohort analysis, and versioned edits. Ask for a supported AI provider and securely configured server credential before adding generative analysis.

## Next: account cash flows and rules
Add deposits, payouts, resets and adjustments as separate cash-flow records. Model each firm's configurable drawdown behavior only after confirming official rules. Journal balances currently exclude these movements.

## Next: weekly reminders
Weekly reviews currently live inside the app. A scheduled reminder needs an agreed day/time and a supported scheduler. Never imply an unattended review is scheduled merely because the review page exists.

## Integration constraints
Direct Topstep/Lucid/Tradeify/TradeSyncer connectivity depends on actual API/export availability and the user's authorized access. Broker execution and copying are outside the current app.

## Acceptance scenarios
1. Add evaluation and funded accounts; reload and see saved data.
2. Log the same decision to two accounts; portfolio dollars sum, decision count stays one.
3. Edit one account's actual fills/fees without changing its counterpart.
4. Verify overnight/DST sessions and a clock visible while logging.
5. Check sweep-only and MSS-only entries both satisfy the trigger.
6. Verify fees, zero outcomes, losing trades, no-loss profit factor and invalid R.
7. Dictate with permission; stop; deny permission; type fallback; preserve text.
8. Restore a valid backup; reject malformed records without changing existing data.
9. Create a concurrent save; preserve the draft and report a conflict.
10. Save a weekly reflection and reopen it in the selected week.
