import { z } from "zod";
const id = z.string().min(1).max(128).regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]*$/);
const money = z.number().finite().min(0).max(1_000_000_000);
const price = z.number().finite().positive().max(100_000_000);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, "Use a real calendar date (YYYY-MM-DD)");
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const account = z.object({
  id, name: z.string().trim().min(1).max(120), firm: z.string().trim().min(1).max(120),
  stage: z.enum(["Evaluation", "Funded"]), startingBalance: money,
  dailyLossLimit: money, maxRisk: money, archived: z.boolean().optional(),
}).strict();
const trade = z.object({
  id, accountId: id, groupId: z.string().max(128), date, time,
  symbol: z.enum(["MGC", "MNQ"]), side: z.enum(["Long", "Short"]),
  qty: z.number().int().positive().max(10000), entry: price, exit: price,
  stop: price, target: price, fees: money,
  checks: z.object({ bias: z.boolean(), poi: z.boolean(), pd: z.boolean(), sweep: z.boolean(), mss: z.boolean() }).strict(),
  notes: z.string().max(25000), session: z.string().max(100),
}).strict();
export const stateSchema = z.object({
  accounts: z.array(account).max(300), trades: z.array(trade).max(20000),
  reviews: z.array(z.object({ id, week: date, notes: z.string().max(25000) }).strict()).max(1500),
  settings: z.object({ windows: z.array(z.object({ name: z.string().trim().min(1).max(60), start: time, end: time }).strict().refine(w => w.start !== w.end, "A session start and end must differ")).min(1).max(12) }).strict(),
  revision: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER - 1),
}).strict().superRefine((value, ctx) => {
  for (const key of ["accounts", "trades", "reviews"] as const) {
    const ids = new Set<string>();
    value[key].forEach((item, index) => {
      if (ids.has(item.id)) ctx.addIssue({ code: "custom", path: [key, index, "id"], message: "Duplicate ID" });
      ids.add(item.id);
    });
  }
  const accountIds = new Set(value.accounts.map(a => a.id));
  value.trades.forEach((t, index) => {
    if (!accountIds.has(t.accountId)) ctx.addIssue({ code: "custom", path: ["trades", index, "accountId"], message: "Trade references an account that does not exist" });
  });
});
export const emptyState = {
  accounts: [], trades: [], reviews: [], revision: 0,
  settings: { windows: [
    { name: "Asia", start: "20:00", end: "00:00" },
    { name: "London", start: "02:00", end: "05:00" },
    { name: "New York", start: "07:00", end: "10:00" },
  ] },
};
