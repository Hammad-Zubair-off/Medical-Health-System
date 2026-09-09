import { startOfLocalDay } from "./holiday.utils";

/**
 * Inclusive leave-day count. Weekend days (Sat/Sun) are excluded by default
 * so a Fri–Mon request counts as 2 working days.
 */
export function countLeaveDays(
  from: Date,
  to: Date,
  options: { excludeWeekends?: boolean } = {}
): number {
  const excludeWeekends = options.excludeWeekends !== false;
  const start = startOfLocalDay(from);
  const end = startOfLocalDay(to);
  if (end.getTime() < start.getTime()) return 0;

  let count = 0;
  const cursor = new Date(start);
  while (cursor.getTime() <= end.getTime()) {
    const day = cursor.getDay();
    const isWeekend = day === 0 || day === 6;
    if (!excludeWeekends || !isWeekend) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}
