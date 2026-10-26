import { format, isBefore, parseISO, startOfToday } from "date-fns";

export function formatDueDate(dueDate: string): string {
    return format(parseISO(dueDate), "dd.MM.yy");
}

export function isOverdue(dueDate: string | null, status: string): boolean {
    // "missed" is a past routine occurrence that no longer counts as due.
    if (!dueDate || status === "done" || status === "missed") return false;
    return isBefore(parseISO(dueDate), startOfToday());
}