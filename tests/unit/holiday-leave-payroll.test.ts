import { beforeEach, describe, expect, it } from "vitest";
import {
  anyHolidayMatchesDate,
  holidayMatchesDate,
  sameCalendarDay,
  sameMonthDay,
  startOfLocalDay,
} from "../../src/core/utils/holiday.utils";
import { countLeaveDays } from "../../src/core/utils/leave.utils";
import { computeNetPay } from "../../src/core/utils/money.utils";

describe("clinic-wide holiday blocks booking (scheduler contract)", () => {
  it("active clinic holiday on the booking day must match", () => {
    const bookingDay = startOfLocalDay(new Date(2026, 11, 25));
    const clinicHolidays = [
      {
        date: new Date(2026, 11, 25),
        isRecurring: false,
        status: "active" as const,
      },
    ];
    // isHoliday() short-circuits on isClinicWideHoliday → anyHolidayMatchesDate
    expect(anyHolidayMatchesDate(clinicHolidays, bookingDay)).toBe(true);
  });

  it("inactive clinic holiday must not block booking", () => {
    const bookingDay = startOfLocalDay(new Date(2026, 11, 25));
    expect(
      anyHolidayMatchesDate(
        [
          {
            date: new Date(2026, 11, 25),
            isRecurring: false,
            status: "inactive",
          },
        ],
        bookingDay
      )
    ).toBe(false);
  });
});

describe("holiday.utils date matching", () => {
  it("sameCalendarDay ignores time-of-day", () => {
    const a = new Date(2026, 8, 9, 23, 59);
    const b = new Date(2026, 8, 9, 0, 1);
    expect(sameCalendarDay(a, b)).toBe(true);
    expect(sameCalendarDay(a, new Date(2026, 8, 10))).toBe(false);
  });

  it("sameMonthDay matches recurring anniversaries across years", () => {
    expect(sameMonthDay(new Date(2020, 0, 1), new Date(2026, 0, 1))).toBe(true);
    expect(sameMonthDay(new Date(2020, 0, 1), new Date(2026, 0, 2))).toBe(false);
  });

  it("holidayMatchesDate respects status and recurring flag", () => {
    const check = startOfLocalDay(new Date(2026, 8, 9));
    expect(
      holidayMatchesDate(
        { date: new Date(2026, 8, 9), isRecurring: false, status: "active" },
        check
      )
    ).toBe(true);
    expect(
      holidayMatchesDate(
        { date: new Date(2026, 8, 9), isRecurring: false, status: "inactive" },
        check
      )
    ).toBe(false);
    expect(
      holidayMatchesDate(
        { date: new Date(2019, 8, 9), isRecurring: true, status: "active" },
        check
      )
    ).toBe(true);
    expect(
      holidayMatchesDate(
        { date: new Date(2019, 8, 9), isRecurring: false, status: "active" },
        check
      )
    ).toBe(false);
  });

  it("anyHolidayMatchesDate finds the first match", () => {
    const check = new Date(2026, 11, 25);
    expect(
      anyHolidayMatchesDate(
        [
          { date: new Date(2020, 11, 25), isRecurring: true, status: "active" },
          { date: new Date(2026, 0, 1), isRecurring: false, status: "active" },
        ],
        check
      )
    ).toBe(true);
  });
});

describe("countLeaveDays", () => {
  it("excludes weekends by default", () => {
    // Fri Sep 4 2026 – Mon Sep 7 2026 → Fri + Mon = 2
    expect(countLeaveDays(new Date(2026, 8, 4), new Date(2026, 8, 7))).toBe(2);
  });

  it("can include weekends", () => {
    expect(
      countLeaveDays(new Date(2026, 8, 4), new Date(2026, 8, 7), {
        excludeWeekends: false,
      })
    ).toBe(4);
  });
});

describe("computeNetPay", () => {
  it("sums basic + allowances − deductions in minor units", () => {
    expect(computeNetPay(100000, [10000, 5000], [2000, 3000])).toBe(110000);
  });

  it("never goes negative", () => {
    expect(computeNetPay(1000, [], [5000])).toBe(0);
  });
});

describe("smoke", () => {
  beforeEach(() => {
    // no-op — keeps describe grouping valid if vitest config requires it
  });
  it("startOfLocalDay zeroes the clock", () => {
    const d = startOfLocalDay(new Date(2026, 8, 9, 15, 30));
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
  });
});
