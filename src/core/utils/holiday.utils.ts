import { toDate } from "./firestore.utils";

/** Normalize to local midnight for calendar-day comparisons. */
export function startOfLocalDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** True when two dates fall on the same local calendar day. */
export function sameCalendarDay(a: Date, b: Date): boolean {
  const left = startOfLocalDay(a);
  const right = startOfLocalDay(b);
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

/** True when month and day match (used for recurring holidays). */
export function sameMonthDay(a: Date, b: Date): boolean {
  return a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export interface HolidayMatchInput {
  date: Date | { toDate: () => Date } | null | undefined;
  isRecurring?: boolean | null;
  status?: string | null;
}

/**
 * Whether a clinic Holiday (or doctor holiday-like object) matches `checkDate`.
 * Inactive holidays never match. Recurring holidays match on month/day only.
 */
export function holidayMatchesDate(
  holiday: HolidayMatchInput,
  checkDate: Date
): boolean {
  if (holiday.status != null && holiday.status !== "active") return false;
  const holidayDate = toDate(holiday.date as Date | null | undefined);
  if (!holidayDate) return false;

  if (holiday.isRecurring) {
    return sameMonthDay(holidayDate, checkDate);
  }
  return sameCalendarDay(holidayDate, checkDate);
}

/** True if any holiday in the list matches the check date. */
export function anyHolidayMatchesDate(
  holidays: HolidayMatchInput[],
  checkDate: Date
): boolean {
  return holidays.some((h) => holidayMatchesDate(h, checkDate));
}
