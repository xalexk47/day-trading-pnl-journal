/** Contract multipliers verified against CME contract specifications, October 2026. */
export const CONTRACTS = {
  MGC: { pointValue: 10, tickSize: 0.1, tickValue: 1 },
  MNQ: { pointValue: 2, tickSize: 0.25, tickValue: 0.5 },
} as const;

export interface Account {
  id: string; name: string; firm: string; stage: 'Evaluation' | 'Funded';
  startingBalance: number; dailyLossLimit: number; maxRisk: number; archived?: boolean;
}
export interface Trade {
  id: string; accountId: string; groupId: string; date: string; time: string;
  symbol: 'MGC' | 'MNQ'; side: 'Long' | 'Short'; qty: number;
  entry: number; exit: number; stop: number; target: number; fees: number;
  checks: { bias: boolean; poi: boolean; pd: boolean; sweep: boolean; mss: boolean };
  notes: string; session: string;
}
export interface Review { id: string; week: string; notes: string }
export interface SessionWindow { name: string; start: string; end: string }
export const DEFAULT_WINDOWS: SessionWindow[] = [
  { name: 'Asia', start: '20:00', end: '00:00' },
  { name: 'London', start: '02:00', end: '05:00' },
  { name: 'New York', start: '07:00', end: '10:00' },
];
const cents = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export function tradeNet(t: Trade): number {
  return cents((t.exit - t.entry) * (t.side === 'Long' ? 1 : -1) * t.qty * CONTRACTS[t.symbol].pointValue - t.fees);
}
/** Initial price risk, excluding fees. Zero/incorrect-side stops have no usable R. */
export function tradeRisk(t: Trade): number {
  const distance = t.side === 'Long' ? t.entry - t.stop : t.stop - t.entry;
  return distance > 0 && t.qty > 0 ? cents(distance * t.qty * CONTRACTS[t.symbol].pointValue) : 0;
}
export function tradeR(t: Trade): number | null {
  const risk = tradeRisk(t);
  return risk > 0 ? tradeNet(t) / risk : null;
}
export function confluencesMet(t: Pick<Trade, 'checks'>): boolean {
  return t.checks.bias && t.checks.poi && t.checks.pd && (t.checks.sweep || t.checks.mss);
}
export interface TradingStats {
  total: number; n: number; wins: number; losses: number; breakevens: number;
  winRate: number; avgWin: number; avgLoss: number; expectancy: number;
  profitFactor: number | null; avgR: number | null; maxDrawdown: number;
}
/** Win rate uses all closed observations, including breakevens; average loss is positive.
 * Drawdown is based on recorded closed trades (not intratrade or prop-firm trailing equity).
 * No-loss profit factor is null so consumers can explicitly display N/A or infinity.
 */
export function stats(trades: readonly Trade[]): TradingStats {
  const ordered = [...trades].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  let total = 0, wins = 0, losses = 0, grossWins = 0, grossLosses = 0;
  let peak = 0, maxDrawdown = 0, rSum = 0, rN = 0;
  for (const trade of ordered) {
    const net = tradeNet(trade);
    total = cents(total + net);
    if (net > 0) { wins++; grossWins += net; }
    else if (net < 0) { losses++; grossLosses -= net; }
    peak = Math.max(peak, total);
    maxDrawdown = Math.max(maxDrawdown, cents(peak - total));
    const r = tradeR(trade);
    if (r !== null) { rSum += r; rN++; }
  }
  const n = trades.length;
  return { total, n, wins, losses, breakevens: n - wins - losses,
    winRate: n ? wins / n : 0, avgWin: wins ? grossWins / wins : 0,
    avgLoss: losses ? grossLosses / losses : 0, expectancy: n ? total / n : 0,
    profitFactor: grossLosses > 0 ? grossWins / grossLosses : null,
    avgR: rN ? rSum / rN : null, maxDrawdown };
}
/** Copy groups represent a single strategy decision. Aggregate dollars, risk and costs
 * across copied accounts, but count each decision once. Grouped dollar expectancy
 * is portfolio dollars per decision and scales with copied account exposure;
 * grouped mean R is the more comparable strategy measure. Incompatible instruments,
 * directions or dates are never combined even if a group label was reused.
 */
export function groupTrades(trades: readonly Trade[]): Trade[] {
  const groups = new Map<string, Trade[]>();
  for (const t of trades) {
    const key = t.groupId.trim()
      ? JSON.stringify([t.groupId.trim(), t.date, t.symbol, t.side])
      : JSON.stringify(['individual', t.id]);
    const group = groups.get(key) ?? [];
    group.push(t); groups.set(key, group);
  }
  return [...groups.values()].map(group => {
    const first = group[0];
    const qty = group.reduce((sum, t) => sum + t.qty, 0);
    const weighted = (field: 'entry' | 'exit' | 'stop' | 'target') =>
      qty ? group.reduce((sum, t) => sum + t[field] * t.qty, 0) / qty : first[field];
    const checks = { ...first.checks };
    for (const key of Object.keys(checks) as (keyof Trade['checks'])[]) {
      checks[key] = group.every(t => t.checks[key]);
    }
    return { ...first, checks, qty, time: group.map(t => t.time).sort()[0],
      entry: weighted('entry'), exit: weighted('exit'),
      stop: group.every(t => tradeRisk(t) > 0) ? weighted('stop') : weighted('entry'),
      target: weighted('target'), fees: cents(group.reduce((sum, t) => sum + t.fees, 0)) };
  });
}
export function dateInZone(date: Date = new Date(), timeZone = 'America/New_York'): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)!.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
export const dateNY = (date = new Date()) => dateInZone(date, 'America/New_York');
export const dateChicago = (date = new Date()) => dateInZone(date, 'America/Chicago');
export function timeNY(date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);
}
function minuteOfDay(time: string): number {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return NaN;
  const [h, m] = time.split(':').map(Number); return h * 60 + m;
}
/** NY wall-clock windows follow New York daylight saving time. Start inclusive/end exclusive.
 * These are configurable trader-defined windows, not official exchange sessions.
 */
export function sessionAt(date = new Date(), windows: readonly SessionWindow[] = DEFAULT_WINDOWS): string {
  const minute = minuteOfDay(timeNY(date));
  return windows.find(w => {
    const start = minuteOfDay(w.start), end = minuteOfDay(w.end);
    return start < end ? minute >= start && minute < end : start > end && (minute >= start || minute < end);
  })?.name ?? 'Off session';
}
/** Monday key calculated from the user's explicit trading date, never UTC-converted. */
export function weekStart(date: string): string {
  const d = new Date(date + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7);
  return d.toISOString().slice(0, 10);
}
