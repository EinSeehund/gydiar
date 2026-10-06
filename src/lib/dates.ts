import { format, isBefore, parseISO, startOfToday } from "date-fns";

export function formatDueDate(dueDate: string): string {
    return format(parseISO(dueDate), "dd.MM.yy");
}

export function isOverdue(dueDate: string | null, status: string): boolean {
    if (!dueDate || status === "done") return false; 
    return isBefore(parseISO(dueDate), startOfToday());
}