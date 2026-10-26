import { describe, expect, it } from "vitest";
import type { RecurrenceRule } from "@/types/routine";
import {
    describeRecurrence,
    isOccurrence,
    latestOccurrenceBefore,
    occurrenceStatus,
    occurrencesBetween,
} from "./recurrence";

const daily: RecurrenceRule = { freq: "day", interval: 1, weekdays: null, month_day: null, year_month: null };

describe("occurrencesBetween", () => {
    it("returns every day for a daily rule", () => {
        expect(
            occurrencesBetween(daily, "2026-01-01", "2026-01-03", "2026-01-05"),
        ).toEqual(["2026-01-03", "2026-01-04", "2026-01-05"]);
    });

    it("counts every-N-days from the anchor, not from the range start", () => {
        const rule: RecurrenceRule = { freq: "day", interval: 3, weekdays: null, month_day: null, year_month: null };
        expect(
            occurrencesBetween(rule, "2026-01-01", "2026-01-02", "2026-01-10"),
        ).toEqual(["2026-01-04", "2026-01-07", "2026-01-10"]);
    });

    it("never returns dates before the anchor", () => {
        expect(
            occurrencesBetween(daily, "2026-01-10", "2026-01-01", "2026-01-11"),
        ).toEqual(["2026-01-10", "2026-01-11"]);
    });

    it("returns nothing when the range ends before the anchor", () => {
        expect(
            occurrencesBetween(daily, "2026-02-01", "2026-01-01", "2026-01-31"),
        ).toEqual([]);
    });

    it("produces several weekdays in every other ISO week", () => {
        // 2026-01-05 is a Monday.
        const rule: RecurrenceRule = { freq: "week", interval: 2, weekdays: [2, 4], month_day: null, year_month: null };
        expect(
            occurrencesBetween(rule, "2026-01-05", "2026-01-05", "2026-02-01"),
        ).toEqual(["2026-01-06", "2026-01-08", "2026-01-20", "2026-01-22"]);
    });

    it("skips selected weekdays before an anchor that isn't one of them", () => {
        // Anchor Wednesday 2026-01-07; Monday and Friday are selected.
        const rule: RecurrenceRule = { freq: "week", interval: 1, weekdays: [1, 5], month_day: null, year_month: null };
        expect(
            occurrencesBetween(rule, "2026-01-07", "2026-01-01", "2026-01-14"),
        ).toEqual(["2026-01-09", "2026-01-12"]);
    });

    it("keeps the bi-weekly rhythm for a range far after the anchor", () => {
        const rule: RecurrenceRule = { freq: "week", interval: 2, weekdays: [1], month_day: null, year_month: null };
        // 2026-01-05 + 52 weeks = 2027-01-04 (an even number of weeks).
        expect(
            occurrencesBetween(rule, "2026-01-05", "2026-12-28", "2027-01-10"),
        ).toEqual(["2027-01-04"]);
    });

    it("clamps monthly rules to month end without drifting", () => {
        const rule: RecurrenceRule = { freq: "month", interval: 1, weekdays: null, month_day: 31, year_month: null };
        expect(
            occurrencesBetween(rule, "2026-01-31", "2026-01-01", "2026-04-30"),
        ).toEqual(["2026-01-31", "2026-02-28", "2026-03-31", "2026-04-30"]);
    });

    it("moves Feb 29 to Feb 28 in non-leap years and back in leap years", () => {
        const rule: RecurrenceRule = { freq: "year", interval: 1, weekdays: null, month_day: 29, year_month: 2 };
        expect(
            occurrencesBetween(rule, "2028-02-29", "2028-01-01", "2032-12-31"),
        ).toEqual([
            "2028-02-29",
            "2029-02-28",
            "2030-02-28",
            "2031-02-28",
            "2032-02-29",
        ]);
    });

    it("supports every N months", () => {
        const rule: RecurrenceRule = { freq: "month", interval: 2, weekdays: null, month_day: 15, year_month: null };
        expect(
            occurrencesBetween(rule, "2026-01-15", "2026-02-01", "2026-07-31"),
        ).toEqual(["2026-03-15", "2026-05-15", "2026-07-15"]);
    });
});

describe("occurrencesBetween with month_day", () => {
    it("uses the beginning of the month, starting after the anchor", () => {
        const rule: RecurrenceRule = { freq: "month", interval: 1, weekdays: null, month_day: 1, year_month: null };
        expect(
            occurrencesBetween(rule, "2026-01-20", "2026-01-01", "2026-03-31"),
        ).toEqual(["2026-02-01", "2026-03-01"]);
    });

    it("uses the last day of each month for -1", () => {
        const rule: RecurrenceRule = { freq: "month", interval: 1, weekdays: null, month_day: -1, year_month: null };
        expect(
            occurrencesBetween(rule, "2028-01-10", "2028-01-01", "2028-04-30"),
        ).toEqual(["2028-01-31", "2028-02-29", "2028-03-31", "2028-04-30"]);
    });

    it("clamps a custom day to shorter months and returns afterwards", () => {
        const rule: RecurrenceRule = { freq: "month", interval: 1, weekdays: null, month_day: 30, year_month: null };
        expect(
            occurrencesBetween(rule, "2026-01-01", "2026-01-01", "2026-03-31"),
        ).toEqual(["2026-01-30", "2026-02-28", "2026-03-30"]);
    });

    it("counts every N months from the anchor's month", () => {
        const rule: RecurrenceRule = { freq: "month", interval: 2, weekdays: null, month_day: -1, year_month: null };
        expect(
            occurrencesBetween(rule, "2026-01-05", "2026-02-01", "2026-06-30"),
        ).toEqual(["2026-03-31", "2026-05-31"]);
    });
});

describe("occurrencesBetween for yearly rules", () => {
    it("uses the chosen month and day, starting after the anchor", () => {
        const rule: RecurrenceRule = { freq: "year", interval: 1, weekdays: null, month_day: 15, year_month: 3 };
        expect(
            occurrencesBetween(rule, "2026-10-26", "2026-01-01", "2028-12-31"),
        ).toEqual(["2027-03-15", "2028-03-15"]);
    });

    it("includes the anchor year when the date is still ahead", () => {
        const rule: RecurrenceRule = { freq: "year", interval: 1, weekdays: null, month_day: 24, year_month: 12 };
        expect(
            occurrencesBetween(rule, "2026-10-26", "2026-01-01", "2027-12-31"),
        ).toEqual(["2026-12-24", "2027-12-24"]);
    });

    it("supports beginning and end of the month", () => {
        const end: RecurrenceRule = { freq: "year", interval: 1, weekdays: null, month_day: -1, year_month: 2 };
        expect(
            occurrencesBetween(end, "2027-01-01", "2027-01-01", "2028-12-31"),
        ).toEqual(["2027-02-28", "2028-02-29"]);
        const beginning: RecurrenceRule = { freq: "year", interval: 1, weekdays: null, month_day: 1, year_month: 1 };
        expect(
            occurrencesBetween(beginning, "2026-06-01", "2026-01-01", "2027-12-31"),
        ).toEqual(["2027-01-01"]);
    });

    it("counts every N years from the anchor's year", () => {
        const rule: RecurrenceRule = { freq: "year", interval: 2, weekdays: null, month_day: 1, year_month: 7 };
        expect(
            occurrencesBetween(rule, "2026-01-01", "2027-01-01", "2031-12-31"),
        ).toEqual(["2028-07-01", "2030-07-01"]);
    });

    it("finds the latest yearly occurrence before a date", () => {
        const rule: RecurrenceRule = { freq: "year", interval: 1, weekdays: null, month_day: 15, year_month: 3 };
        expect(latestOccurrenceBefore(rule, "2026-01-01", "2028-03-14")).toBe(
            "2027-03-15",
        );
    });
});

describe("isOccurrence", () => {
    const rule: RecurrenceRule = { freq: "week", interval: 1, weekdays: [1], month_day: null, year_month: null };

    it("is true for a matching date", () => {
        expect(isOccurrence(rule, "2026-01-05", "2026-01-12")).toBe(true);
    });

    it("is false for a non-matching date", () => {
        expect(isOccurrence(rule, "2026-01-05", "2026-01-13")).toBe(false);
    });
});

describe("latestOccurrenceBefore", () => {
    it("returns the previous day for a daily rule", () => {
        expect(latestOccurrenceBefore(daily, "2026-01-01", "2026-01-10")).toBe(
            "2026-01-09",
        );
    });

    it("finds the last weekly occurrence before the date", () => {
        const rule: RecurrenceRule = { freq: "week", interval: 2, weekdays: [1, 4], month_day: null, year_month: null };
        expect(latestOccurrenceBefore(rule, "2026-01-05", "2026-01-19")).toBe(
            "2026-01-08",
        );
    });

    it("finds the last clamped monthly occurrence", () => {
        const rule: RecurrenceRule = { freq: "month", interval: 1, weekdays: null, month_day: 31, year_month: null };
        expect(latestOccurrenceBefore(rule, "2026-01-31", "2026-03-15")).toBe(
            "2026-02-28",
        );
    });

    it("returns null when nothing happened before the date", () => {
        expect(latestOccurrenceBefore(daily, "2026-01-10", "2026-01-10")).toBe(
            null,
        );
    });
});

describe("describeRecurrence", () => {
    it("describes simple intervals", () => {
        expect(describeRecurrence(daily)).toBe("Every day");
        expect(
            describeRecurrence({ freq: "year", interval: 3, weekdays: null, month_day: null, year_month: null }),
        ).toBe("Every 3 years");
    });

    it("names month and day for yearly rules", () => {
        expect(
            describeRecurrence({ freq: "year", interval: 1, weekdays: null, month_day: 15, year_month: 3 }),
        ).toBe("Every year on March 15");
        expect(
            describeRecurrence({ freq: "year", interval: 2, weekdays: null, month_day: -1, year_month: 2 }),
        ).toBe("Every 2 years on the last day of February");
    });

    it("names the day for monthly rules", () => {
        expect(
            describeRecurrence({ freq: "month", interval: 1, weekdays: null, month_day: 1, year_month: null }),
        ).toBe("Every month on the 1st");
        expect(
            describeRecurrence({ freq: "month", interval: 2, weekdays: null, month_day: 22, year_month: null }),
        ).toBe("Every 2 months on the 22nd");
        expect(
            describeRecurrence({ freq: "month", interval: 1, weekdays: null, month_day: 13, year_month: null }),
        ).toBe("Every month on the 13th");
        expect(
            describeRecurrence({ freq: "month", interval: 1, weekdays: null, month_day: -1, year_month: null }),
        ).toBe("Every month on the last day");
    });

    it("lists weekdays in Monday-first order", () => {
        expect(
            describeRecurrence({ freq: "week", interval: 2, weekdays: [4, 1], month_day: null, year_month: null }),
        ).toBe("Every 2 weeks on Mon, Thu");
    });
});

describe("occurrenceStatus", () => {
    const base = {
        date: "2026-01-05",
        completed: false,
        keepOpen: false,
        today: "2026-01-10",
        latestMissed: "2026-01-09",
    };

    it("is done when completed, even in the past", () => {
        expect(occurrenceStatus({ ...base, completed: true })).toBe("done");
    });

    it("is open for today and future dates", () => {
        expect(occurrenceStatus({ ...base, date: "2026-01-10" })).toBe("open");
        expect(occurrenceStatus({ ...base, date: "2026-01-12" })).toBe("open");
    });

    it("keeps only the latest missed occurrence open for keep-open routines", () => {
        expect(
            occurrenceStatus({ ...base, keepOpen: true, date: "2026-01-09" }),
        ).toBe("open");
        expect(
            occurrenceStatus({ ...base, keepOpen: true, date: "2026-01-08" }),
        ).toBe("missed");
    });

    it("marks past occurrences of dismiss routines as missed", () => {
        expect(occurrenceStatus({ ...base, date: "2026-01-09" })).toBe("missed");
    });
});
