import {
    parseDueDate,
    parseKeepOpen,
    parseRecurrence,
    parseText,
    MAX_TASK_TITLE_LENGTH,
} from "@/lib/validation";
import type { RoutinePayload } from "@/types/routine";

// Shared by POST /api/routines and PUT /api/routines/[id].
export function parseRoutinePayload(body: unknown): RoutinePayload {
    const input = (typeof body === "object" && body !== null ? body : {}) as
        Record<string, unknown>;

    const title = parseText(input.title, MAX_TASK_TITLE_LENGTH, "Title");
    const anchorDate = parseDueDate(input.anchor_date);
    if (!anchorDate) {
        throw new Error("Start date is required");
    }
    const categoryId = input.category_id ?? null;
    if (categoryId !== null && !Number.isInteger(categoryId)) {
        throw new Error("Invalid category");
    }

    return {
        title,
        category_id: categoryId as number | null,
        anchor_date: anchorDate,
        keep_open: parseKeepOpen(input.keep_open),
        ...parseRecurrence(input),
    };
}

export const ROUTINE_COLUMNS = `id, title, category_id, freq, "interval", weekdays, month_day, year_month,
    anchor_date::text AS anchor_date, keep_open`;
