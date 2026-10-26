import type { RecurrenceRule } from "@/types/routine";
import { LAST_DAY_OF_MONTH, maxDaysInMonth } from "@/lib/recurrence";

export function parseDueDate(value: unknown): string | null | undefined {
    if (value === undefined) return undefined;
    if (value === null || value === "") return null;
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new Error("Ungültiges Datum");
    }
    return value;
}

// Mirrors the DB column sizes so a bad request fails with a clean 400
// instead of a raw Postgres "value too long" 500.
export const MAX_TASK_TITLE_LENGTH = 150;
export const MAX_CATEGORY_NAME_LENGTH = 50; // categories.name is varchar(100)
export const MAX_PROJECT_NAME_LENGTH = 50; // projects.name is varchar(150)
export const MAX_DESCRIPTION_LENGTH = 1000;

/**
 * Validates a required, trimmed text field (task title, category/project
 * name). Throws with a message safe to return to the client directly.
 */
export function parseText(
    value: unknown,
    maxLength: number,
    label: string,
): string {
    if (typeof value !== "string" || !value.trim()) {
        throw new Error(`${label} is required`);
    }
    const trimmed = value.trim();
    if (trimmed.length > maxLength) {
        throw new Error(`${label} must be at most ${maxLength} characters`);
    }
    return trimmed;
}

/**
 * Validates an optional, nullable text field (project description).
 * Mirrors parseDueDate's undefined/null/"" handling so callers can use
 * `?? null` the same way.
 */
export function parseOptionalText(
    value: unknown,
    maxLength: number,
): string | null | undefined {
    if (value === undefined) return undefined;
    if (value === null || value === "") return null;
    if (typeof value !== "string" || value.length > maxLength) {
        throw new Error(`Must be at most ${maxLength} characters`);
    }
    return value;
}

/**
 * Validates an ISO 8601 timestamp with a time zone (e.g. from
 * Date.toISOString()), used for client-local day boundaries.
 */
export function parseTimestamp(value: unknown): string | undefined {
    if (value === undefined) return undefined;
    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.test(
            value,
        ) ||
        Number.isNaN(Date.parse(value))
    ) {
        throw new Error("Invalid timestamp");
    }
    return value;
}

export const MAX_RECURRENCE_INTERVAL = 99;

/**
 * Validates a routine's recurrence rule. Weekdays are ISO (1 = Monday) and
 * required for weekly rules; month_day (1-31, or -1 for the last day) is
 * required for monthly and yearly rules, year_month (1-12) for yearly rules.
 * Fields that don't apply to the frequency are dropped.
 */
export function parseRecurrence(value: unknown): RecurrenceRule {
    if (typeof value !== "object" || value === null) {
        throw new Error("Recurrence is required");
    }
    const { freq, interval, weekdays, month_day, year_month } = value as Record<
        string,
        unknown
    >;

    if (
        freq !== "day" &&
        freq !== "week" &&
        freq !== "month" &&
        freq !== "year"
    ) {
        throw new Error("Invalid recurrence unit");
    }
    if (
        typeof interval !== "number" ||
        !Number.isInteger(interval) ||
        interval < 1 ||
        interval > MAX_RECURRENCE_INTERVAL
    ) {
        throw new Error(
            `Interval must be a whole number between 1 and ${MAX_RECURRENCE_INTERVAL}`,
        );
    }
    if (freq === "month") {
        if (
            !Number.isInteger(month_day) ||
            (month_day !== LAST_DAY_OF_MONTH &&
                ((month_day as number) < 1 || (month_day as number) > 31))
        ) {
            throw new Error("Choose a day between 1 and 31");
        }
        return {
            freq,
            interval,
            weekdays: null,
            month_day: month_day as number,
            year_month: null,
        };
    }
    if (freq === "year") {
        if (
            typeof year_month !== "number" ||
            !Number.isInteger(year_month) ||
            year_month < 1 ||
            year_month > 12
        ) {
            throw new Error("Choose a month");
        }
        // Days that never exist in the month (e.g. April 31) are rejected
        // rather than clamped; Feb 29 is allowed and clamped in other years.
        const maxDays = maxDaysInMonth(year_month);
        if (
            !Number.isInteger(month_day) ||
            (month_day !== LAST_DAY_OF_MONTH &&
                ((month_day as number) < 1 || (month_day as number) > maxDays))
        ) {
            throw new Error(`Choose a day between 1 and ${maxDays}`);
        }
        return {
            freq,
            interval,
            weekdays: null,
            month_day: month_day as number,
            year_month,
        };
    }
    if (freq !== "week") {
        return { freq, interval, weekdays: null, month_day: null, year_month: null };
    }
    if (
        !Array.isArray(weekdays) ||
        weekdays.length === 0 ||
        !weekdays.every(
            (day) => Number.isInteger(day) && day >= 1 && day <= 7,
        )
    ) {
        throw new Error("Select at least one weekday");
    }
    const uniqueWeekdays = [...new Set(weekdays as number[])].sort(
        (a, b) => a - b,
    );
    return {
        freq,
        interval,
        weekdays: uniqueWeekdays,
        month_day: null,
        year_month: null,
    };
}

/** The message parseRecurrence would throw, or null for a valid rule. */
export function recurrenceError(value: unknown): string | null {
    try {
        parseRecurrence(value);
        return null;
    } catch (error) {
        return error instanceof Error ? error.message : "Invalid recurrence";
    }
}

export function parseKeepOpen(value: unknown): boolean {
    if (typeof value !== "boolean") {
        throw new Error("Choose what happens to missed occurrences");
    }
    return value;
}

/**
 * Validates a category color as produced by <input type="color">
 * (#rrggbb). Also matches the categories.color varchar(7) column.
 */
export function parseColor(value: unknown): string | null | undefined {
    if (value === undefined) return undefined;
    if (value === null || value === "") return null;
    if (typeof value !== "string" || !/^#[0-9a-fA-F]{6}$/.test(value)) {
        throw new Error("Invalid color");
    }
    return value;
}
