import { describe, expect, it } from "vitest";
import {
    MAX_TASK_TITLE_LENGTH,
    parseColor,
    parseDueDate,
    parseKeepOpen,
    parseOptionalText,
    parseRecurrence,
    parseText,
    parseTimestamp,
    recurrenceError,
} from "./validation";

describe("parseDueDate", () => {
    it("returns undefined for undefined", () => {
        expect(parseDueDate(undefined)).toBeUndefined();
    });

    it("returns null for null", () => {
        expect(parseDueDate(null)).toBeNull();
    });

    it("returns null for an empty string", () => {
        expect(parseDueDate("")).toBeNull();
    });

    it("returns a valid yyyy-MM-dd string unchanged", () => {
        expect(parseDueDate("2026-03-05")).toBe("2026-03-05");
    });

    it("throws for a malformed date string", () => {
        expect(() => parseDueDate("05.03.2026")).toThrow("Ungültiges Datum");
    });

    it("throws for a non-string value", () => {
        expect(() => parseDueDate(123)).toThrow("Ungültiges Datum");
    });
});

describe("parseText", () => {
    it("trims surrounding whitespace", () => {
        expect(parseText("  Buy milk  ", MAX_TASK_TITLE_LENGTH, "Task title")).toBe(
            "Buy milk",
        );
    });

    it("throws for an empty string", () => {
        expect(() => parseText("", MAX_TASK_TITLE_LENGTH, "Task title")).toThrow(
            "Task title is required",
        );
    });

    it("throws for a whitespace-only string", () => {
        expect(() => parseText("   ", MAX_TASK_TITLE_LENGTH, "Task title")).toThrow(
            "Task title is required",
        );
    });

    it("throws for a non-string value", () => {
        expect(() => parseText(undefined, MAX_TASK_TITLE_LENGTH, "Task title")).toThrow(
            "Task title is required",
        );
    });

    it("throws when the trimmed value exceeds maxLength", () => {
        const tooLong = "a".repeat(MAX_TASK_TITLE_LENGTH + 1);
        expect(() => parseText(tooLong, MAX_TASK_TITLE_LENGTH, "Task title")).toThrow(
            `Task title must be at most ${MAX_TASK_TITLE_LENGTH} characters`,
        );
    });

    it("accepts a value exactly at maxLength", () => {
        const exact = "a".repeat(MAX_TASK_TITLE_LENGTH);
        expect(parseText(exact, MAX_TASK_TITLE_LENGTH, "Task title")).toBe(exact);
    });
});

describe("parseOptionalText", () => {
    it("returns undefined for undefined", () => {
        expect(parseOptionalText(undefined, 1000)).toBeUndefined();
    });

    it("returns null for null", () => {
        expect(parseOptionalText(null, 1000)).toBeNull();
    });

    it("returns null for an empty string", () => {
        expect(parseOptionalText("", 1000)).toBeNull();
    });

    it("returns the value unchanged when within maxLength", () => {
        expect(parseOptionalText("Some notes", 1000)).toBe("Some notes");
    });

    it("throws when the value exceeds maxLength", () => {
        expect(() => parseOptionalText("a".repeat(11), 10)).toThrow(
            "Must be at most 10 characters",
        );
    });

    it("throws for a non-string value", () => {
        expect(() => parseOptionalText(42, 1000)).toThrow(
            "Must be at most 1000 characters",
        );
    });
});

describe("parseColor", () => {
    it("returns undefined for undefined", () => {
        expect(parseColor(undefined)).toBeUndefined();
    });

    it("returns null for null", () => {
        expect(parseColor(null)).toBeNull();
    });

    it("returns null for an empty string", () => {
        expect(parseColor("")).toBeNull();
    });

    it("accepts a lowercase hex color", () => {
        expect(parseColor("#1a2b3c")).toBe("#1a2b3c");
    });

    it("accepts an uppercase hex color", () => {
        expect(parseColor("#1A2B3C")).toBe("#1A2B3C");
    });

    it("throws for a malformed color", () => {
        expect(() => parseColor("blue")).toThrow("Invalid color");
    });

    it("throws for a short hex color", () => {
        expect(() => parseColor("#fff")).toThrow("Invalid color");
    });
});

describe("parseRecurrence", () => {
    it("accepts a daily rule and drops weekdays", () => {
        expect(
            parseRecurrence({ freq: "day", interval: 2, weekdays: [1] }),
        ).toEqual({ freq: "day", interval: 2, weekdays: null, month_day: null, year_month: null });
    });

    it("sorts and de-duplicates weekdays for a weekly rule", () => {
        expect(
            parseRecurrence({ freq: "week", interval: 1, weekdays: [4, 1, 4] }),
        ).toEqual({ freq: "week", interval: 1, weekdays: [1, 4], month_day: null, year_month: null });
    });

    it("throws for a weekly rule without weekdays", () => {
        expect(() =>
            parseRecurrence({ freq: "week", interval: 1, weekdays: [] }),
        ).toThrow("Select at least one weekday");
    });

    it("throws for weekdays outside 1-7", () => {
        expect(() =>
            parseRecurrence({ freq: "week", interval: 1, weekdays: [0] }),
        ).toThrow("Select at least one weekday");
    });

    it("throws for an unknown unit", () => {
        expect(() =>
            parseRecurrence({ freq: "hour", interval: 1, weekdays: null }),
        ).toThrow("Invalid recurrence unit");
    });

    it("throws for an interval outside 1-99 or a non-integer", () => {
        for (const interval of [0, 100, 1.5, "2"]) {
            expect(() =>
                parseRecurrence({ freq: "day", interval, weekdays: null }),
            ).toThrow("Interval must be a whole number between 1 and 99");
        }
    });

    it("accepts a monthly rule with a day or -1 for the last day", () => {
        expect(
            parseRecurrence({ freq: "month", interval: 1, weekdays: [1], month_day: 31, year_month: null }),
        ).toEqual({ freq: "month", interval: 1, weekdays: null, month_day: 31, year_month: null });
        expect(
            parseRecurrence({ freq: "month", interval: 1, month_day: -1, year_month: null }),
        ).toEqual({ freq: "month", interval: 1, weekdays: null, month_day: -1, year_month: null });
    });

    it("throws for a monthly rule without a valid day", () => {
        for (const month_day of [undefined, 0, 32, -2, 1.5]) {
            expect(() =>
                parseRecurrence({ freq: "month", interval: 1, month_day }),
            ).toThrow("Choose a day between 1 and 31");
        }
    });

    it("drops month_day and year_month for daily rules", () => {
        expect(
            parseRecurrence({ freq: "day", interval: 1, month_day: 5, year_month: 3 }),
        ).toEqual({ freq: "day", interval: 1, weekdays: null, month_day: null, year_month: null });
    });

    it("accepts a yearly rule with month and day", () => {
        expect(
            parseRecurrence({ freq: "year", interval: 1, month_day: 29, year_month: 2 }),
        ).toEqual({ freq: "year", interval: 1, weekdays: null, month_day: 29, year_month: 2 });
        expect(
            parseRecurrence({ freq: "year", interval: 1, month_day: -1, year_month: 4 }),
        ).toEqual({ freq: "year", interval: 1, weekdays: null, month_day: -1, year_month: 4 });
    });

    it("throws for a yearly rule without a valid month", () => {
        for (const year_month of [undefined, 0, 13, 1.5]) {
            expect(() =>
                parseRecurrence({ freq: "year", interval: 1, month_day: 1, year_month }),
            ).toThrow("Choose a month");
        }
    });

    it("rejects days that never exist in the chosen month", () => {
        expect(() =>
            parseRecurrence({ freq: "year", interval: 1, month_day: 31, year_month: 4 }),
        ).toThrow("Choose a day between 1 and 30");
        expect(() =>
            parseRecurrence({ freq: "year", interval: 1, month_day: 30, year_month: 2 }),
        ).toThrow("Choose a day between 1 and 29");
    });

    it("throws for a missing rule", () => {
        expect(() => parseRecurrence(undefined)).toThrow("Recurrence is required");
    });
});

describe("parseKeepOpen", () => {
    it("accepts booleans", () => {
        expect(parseKeepOpen(true)).toBe(true);
        expect(parseKeepOpen(false)).toBe(false);
    });

    it("throws when no choice was made", () => {
        expect(() => parseKeepOpen(undefined)).toThrow(
            "Choose what happens to missed occurrences",
        );
    });
});

describe("recurrenceError", () => {
    it("returns null for a valid rule and the message otherwise", () => {
        expect(
            recurrenceError({ freq: "day", interval: 1, weekdays: null, month_day: null, year_month: null }),
        ).toBeNull();
        expect(
            recurrenceError({ freq: "week", interval: 1, weekdays: [], month_day: null, year_month: null }),
        ).toBe("Select at least one weekday");
    });
});

describe("parseTimestamp", () => {
    it("returns undefined for undefined", () => {
        expect(parseTimestamp(undefined)).toBeUndefined();
    });

    it("accepts ISO timestamps with Z or an offset", () => {
        expect(parseTimestamp("2026-10-25T22:00:00.000Z")).toBe(
            "2026-10-25T22:00:00.000Z",
        );
        expect(parseTimestamp("2026-10-26T00:00:00+02:00")).toBe(
            "2026-10-26T00:00:00+02:00",
        );
    });

    it("throws for dates without time or zone, and for SQL-ish input", () => {
        for (const value of ["2026-10-26", "2026-10-26T00:00:00", "now()", 0]) {
            expect(() => parseTimestamp(value)).toThrow("Invalid timestamp");
        }
    });
});
