/** Date-range helpers and report grouping for client-side reports. */

export const DEFAULT_REPORT_DAYS = 30;
/** Soft cap — refuse or truncate rather than unbounded collection scans. */
export const MAX_REPORT_DOCS = 5000;
/** Hard cap on calendar span (days) for a single report query. */
export const MAX_REPORT_RANGE_DAYS = 366;

export interface DateRange {
  from: Date;
  to: Date;
}

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/**
 * Parse an HTML `type="date"` / `YYYY-MM-DD` value as a local calendar date.
 * Avoid `new Date("YYYY-MM-DD")` which is UTC midnight and shifts the day in
 * west-of-UTC timezones.
 */
export function parseLocalDateInput(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    const fallback = new Date(value);
    return startOfDay(fallback);
  }
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function defaultDateRange(days = DEFAULT_REPORT_DAYS): DateRange {
  const to = endOfDay(new Date());
  const from = startOfDay(new Date(to.getTime() - (days - 1) * 24 * 60 * 60 * 1000));
  return { from, to };
}

/** Full calendar month containing `ref` (defaults to today). */
export function currentMonthRange(ref: Date = new Date()): DateRange {
  const from = startOfDay(new Date(ref.getFullYear(), ref.getMonth(), 1));
  const to = endOfDay(new Date(ref.getFullYear(), ref.getMonth() + 1, 0));
  return { from, to };
}

export function daysBetween(from: Date, to: Date): number {
  const ms = endOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

export class ReportRangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReportRangeError";
  }
}

/** Validate / normalise a report range. Defaults to last 30 days. */
export function resolveReportRange(range?: Partial<DateRange> | null): DateRange {
  const fallback = defaultDateRange();
  const from = range?.from ? startOfDay(range.from) : fallback.from;
  const to = range?.to ? endOfDay(range.to) : fallback.to;

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    throw new ReportRangeError("Invalid date range.");
  }
  if (from > to) {
    throw new ReportRangeError("Start date must be before end date.");
  }
  const span = daysBetween(from, to);
  if (span > MAX_REPORT_RANGE_DAYS) {
    throw new ReportRangeError(
      `Date range is too large (${span} days). Narrow to ${MAX_REPORT_RANGE_DAYS} days or fewer.`
    );
  }
  return { from, to };
}

/** Percentage change last vs previous. Returns 0 when both are 0. */
export function percentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export type GroupGranularity = "day" | "week" | "month";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Bucket key for a date at the given granularity (local time). */
export function bucketKey(date: Date, granularity: GroupGranularity): string {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  if (granularity === "day") return `${y}-${m}-${d}`;
  if (granularity === "month") return `${y}-${m}`;
  // ISO-ish week: year + week number
  const tmp = new Date(date);
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  const week1 = new Date(tmp.getFullYear(), 0, 4);
  const week =
    1 +
    Math.round(
      ((tmp.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    );
  return `${tmp.getFullYear()}-W${pad(week)}`;
}

export function groupByPeriod<T>(
  items: T[],
  getDate: (item: T) => Date | null,
  granularity: GroupGranularity = "day"
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const date = getDate(item);
    if (!date) continue;
    const key = bucketKey(date, granularity);
    const bucket = map.get(key) ?? [];
    bucket.push(item);
    map.set(key, bucket);
  }
  return map;
}

export function pickGranularity(range: DateRange): GroupGranularity {
  const days = daysBetween(range.from, range.to);
  if (days <= 45) return "day";
  if (days <= 180) return "week";
  return "month";
}
