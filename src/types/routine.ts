export type RecurrenceFreq = "day" | "week" | "month" | "year";

export type RecurrenceRule = {
    freq: RecurrenceFreq;
    interval: number;
    // ISO weekdays (1 = Monday ... 7 = Sunday); null unless freq is "week".
    weekdays: number[] | null;
    // Day of the month (1-31, or -1 for the last day); null unless freq is
    // "month" or "year".
    month_day: number | null;
    // Month of the year (1-12); null unless freq is "year".
    year_month: number | null;
};

export type Routine = RecurrenceRule & {
    id: number;
    title: string;
    category_id: number | null;
    anchor_date: string;
    keep_open: boolean;
};

export type RoutineOccurrenceStatus = "open" | "done" | "missed";

export type RoutineOccurrence = {
    routine_id: number;
    title: string;
    category_id: number | null;
    // The occurrence date, named like Task.due_date so shared list code can read it.
    due_date: string;
    status: RoutineOccurrenceStatus;
};

export type RoutinePayload = RecurrenceRule & {
    title: string;
    category_id: number | null;
    anchor_date: string;
    keep_open: boolean;
};
