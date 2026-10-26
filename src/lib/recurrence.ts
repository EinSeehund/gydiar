import {
    addDays,
    addMonths,
    differenceInCalendarDays,
    differenceInCalendarMonths,
    format,
    getDate,
    getDaysInMonth,
    getMonth,
    getYear,
    parseISO,
    setDate,
    startOfMonth,
    startOfWeek,
    subDays,
    subMonths,
} from "date-fns";
import type {
    RecurrenceRule,
    RoutineOccurrenceStatus,
} from "@/types/routine";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const LAST_DAY_OF_MONTH = -1;

export const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

// Longest possible length of each month (February in a leap year).
const MAX_DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function maxDaysInMonth(month: number): number {
    return MAX_DAYS_IN_MONTH[month - 1];
}

// month_day in the given month, clamped to the month's length.
function dayOfMonth(month: Date, monthDay: number): Date {
    const lastDay = getDaysInMonth(month);
    const day =
        monthDay === LAST_DAY_OF_MONTH ? lastDay : Math.min(monthDay, lastDay);
    return setDate(month, day);
}

function toDateString(date: Date): string {
    return format(date, "yyyy-MM-dd");
}

/**
 * All occurrence dates (yyyy-MM-dd) of a rule between from and to, inclusive.
 * Jumps straight to the first period at or after `from`, so the cost does
 * not grow with the age of the routine.
 */
export function occurrencesBetween(
    rule: RecurrenceRule,
    anchor: string,
    from: string,
    to: string,
): string[] {
    const start = from > anchor ? from : anchor;
    if (start > to) return [];

    const anchorDate = parseISO(anchor);
    const startDate = parseISO(start);
    const dates: string[] = [];

    if (rule.freq === "day") {
        const elapsed = differenceInCalendarDays(startDate, anchorDate);
        let step = Math.ceil(elapsed / rule.interval);
        for (;;) {
            const date = toDateString(addDays(anchorDate, step * rule.interval));
            if (date > to) break;
            dates.push(date);
            step++;
        }
        return dates;
    }

    if (rule.freq === "week") {
        const weekdays = [...(rule.weekdays ?? [])].sort((a, b) => a - b);
        if (weekdays.length === 0) return [];
        const anchorWeek = startOfWeek(anchorDate, { weekStartsOn: 1 });
        const startWeek = startOfWeek(startDate, { weekStartsOn: 1 });
        const weeksElapsed =
            differenceInCalendarDays(startWeek, anchorWeek) / 7;
        let week = Math.floor(weeksElapsed / rule.interval) * rule.interval;
        for (;;) {
            const weekStart = addDays(anchorWeek, week * 7);
            if (toDateString(weekStart) > to) break;
            for (const weekday of weekdays) {
                const date = toDateString(addDays(weekStart, weekday - 1));
                if (date >= start && date <= to) dates.push(date);
            }
            week += rule.interval;
        }
        return dates;
    }

    if (rule.freq === "month") {
        // Months are counted from the anchor's month; the day comes from
        // month_day, clamped to the month's length (31 -> Feb 28).
        const monthDay = rule.month_day ?? getDate(anchorDate);
        const anchorMonth = startOfMonth(anchorDate);
        const monthsElapsed = differenceInCalendarMonths(startDate, anchorDate);
        let step = Math.floor(monthsElapsed / rule.interval);
        for (;;) {
            const month = addMonths(anchorMonth, step * rule.interval);
            if (toDateString(month) > to) break;
            const date = toDateString(dayOfMonth(month, monthDay));
            if (date >= start && date <= to) dates.push(date);
            step++;
        }
        return dates;
    }

    // Year: years are counted from the anchor's year; month and day come from
    // year_month / month_day, so Feb 29 falls on Feb 28 in other years.
    const yearMonth = rule.year_month ?? getMonth(anchorDate) + 1;
    const monthDay = rule.month_day ?? getDate(anchorDate);
    const anchorYear = getYear(anchorDate);
    let year =
        anchorYear +
        Math.floor((getYear(startDate) - anchorYear) / rule.interval) *
            rule.interval;
    for (;;) {
        const month = new Date(year, yearMonth - 1, 1);
        if (toDateString(month) > to) break;
        const date = toDateString(dayOfMonth(month, monthDay));
        if (date >= start && date <= to) dates.push(date);
        year += rule.interval;
    }
    return dates;
}

export function isOccurrence(
    rule: RecurrenceRule,
    anchor: string,
    date: string,
): boolean {
    return occurrencesBetween(rule, anchor, date, date).length === 1;
}

/** The last occurrence strictly before `date`, or null if there is none. */
export function latestOccurrenceBefore(
    rule: RecurrenceRule,
    anchor: string,
    date: string,
): string | null {
    const target = parseISO(date);
    const dayBefore = toDateString(subDays(target, 1));
    if (dayBefore < anchor) return null;

    // One full period back always contains at least one occurrence.
    let windowStart: Date;
    if (rule.freq === "day") {
        windowStart = subDays(target, rule.interval);
    } else if (rule.freq === "week") {
        windowStart = subDays(target, rule.interval * 7);
    } else {
        const months = rule.freq === "year" ? rule.interval * 12 : rule.interval;
        windowStart = subMonths(target, months + 1);
    }

    const occurrences = occurrencesBetween(
        rule,
        anchor,
        toDateString(windowStart),
        dayBefore,
    );
    return occurrences.at(-1) ?? null;
}

function ordinal(day: number): string {
    const lastTwo = day % 100;
    if (lastTwo >= 11 && lastTwo <= 13) return `${day}th`;
    const suffix = { 1: "st", 2: "nd", 3: "rd" }[day % 10] ?? "th";
    return `${day}${suffix}`;
}

export function describeRecurrence(rule: RecurrenceRule): string {
    const unit = {
        day: ["day", "days"],
        week: ["week", "weeks"],
        month: ["month", "months"],
        year: ["year", "years"],
    }[rule.freq];
    const every =
        rule.interval === 1
            ? `Every ${unit[0]}`
            : `Every ${rule.interval} ${unit[1]}`;

    if (rule.freq === "week" && rule.weekdays && rule.weekdays.length > 0) {
        const labels = [...rule.weekdays]
            .sort((a, b) => a - b)
            .map((weekday) => WEEKDAY_LABELS[weekday - 1]);
        return `${every} on ${labels.join(", ")}`;
    }
    if (
        rule.freq === "year" &&
        rule.month_day !== null &&
        rule.year_month !== null
    ) {
        const monthName = MONTH_NAMES[rule.year_month - 1];
        return rule.month_day === LAST_DAY_OF_MONTH
            ? `${every} on the last day of ${monthName}`
            : `${every} on ${monthName} ${rule.month_day}`;
    }
    if (rule.freq === "month" && rule.month_day !== null) {
        return rule.month_day === LAST_DAY_OF_MONTH
            ? `${every} on the last day`
            : `${every} on the ${ordinal(rule.month_day)}`;
    }
    return every;
}

type OccurrenceStatusInput = {
    date: string;
    completed: boolean;
    keepOpen: boolean;
    today: string;
    latestMissed: string | null;
};

export function occurrenceStatus({
    date,
    completed,
    keepOpen,
    today,
    latestMissed,
}: OccurrenceStatusInput): RoutineOccurrenceStatus {
    if (completed) return "done";
    if (date >= today) return "open";
    // Only the most recent missed occurrence stays open (and overdue).
    if (keepOpen && date === latestMissed) return "open";
    return "missed";
}
