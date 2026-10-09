import type { TaskWithChildren } from "@/types/task";
import type { Category } from "@/types/category";
import type { Project } from "@/types/project";
import { isOverdue } from "@/lib/dates";

export type SortKey = "date" | "category" | "project" | "title";
export type SortDirection = "asc" | "desc";

export type TaskSort = {
    key: SortKey;
    direction: SortDirection;
};

export type TaskView = {
    sort: TaskSort;
    hideOverdue: boolean;
};

export type TaskLookups = {
    categories: Category[];
    projects: Project[];
};

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "date", label: "Date" },
    { key: "category", label: "Category" },
    { key: "project", label: "Project" },
    { key: "title", label: "Title" },
];

export const DEFAULT_SORT: TaskSort = { key: "date", direction: "asc" };
export const DEFAULT_HIDE_OVERDUE = false;

export function isSortKey(value: unknown): value is SortKey {
    return SORT_OPTIONS.some((option) => option.key === value);
}

export function isSortDirection(value: unknown): value is SortDirection {
    return value === "asc" || value === "desc";
}

// Dates are yyyy-MM-dd strings, so plain string comparison is chronological.
function compareDates(a: string, b: string): number {
    return a < b ? -1 : a > b ? 1 : 0;
}

function compareText(a: string, b: string): number {
    return a.localeCompare(b, "de", { sensitivity: "base", numeric: true });
}

// Missing values (null) always go last, regardless of direction.
function compareNullable<T>(
    a: T | null,
    b: T | null,
    compare: (a: T, b: T) => number,
    direction: SortDirection,
): number {
    if (a === null && b === null) return 0;
    if (a === null) return 1;
    if (b === null) return -1;
    const result = compare(a, b);
    return direction === "asc" ? result : -result;
}

export function sortTasks(
    tasks: TaskWithChildren[],
    sort: TaskSort,
    { categories, projects }: TaskLookups,
): TaskWithChildren[] {
    const categoryNames = new Map(categories.map((c) => [c.id, c.name]));
    const projectNames = new Map(projects.map((p) => [p.id, p.name]));

    function sortValue(task: TaskWithChildren): string | null {
        switch (sort.key) {
            case "date":
                return task.due_date;
            case "category":
                return task.category_id === null
                    ? null
                    : (categoryNames.get(task.category_id) ?? null);
            case "project":
                return task.project_id === null
                    ? null
                    : (projectNames.get(task.project_id) ?? null);
            case "title":
                return task.title;
        }
    }

    const comparePrimary = sort.key === "date" ? compareDates : compareText;

    return [...tasks].sort(
        (a, b) =>
            compareNullable(
                sortValue(a),
                sortValue(b),
                comparePrimary,
                sort.direction,
            ) ||
            compareNullable(a.due_date, b.due_date, compareDates, "asc") ||
            compareText(a.title, b.title) ||
            a.id - b.id,
    );
}

function isTaskOverdue(task: TaskWithChildren): boolean {
    return isOverdue(task.due_date, task.status);
}

export function countOverdueTasks(tasks: TaskWithChildren[]): number {
    return tasks.filter(isTaskOverdue).length;
}

// Single entry point for deriving the displayed list; add filtering here.
export function applyTaskView(
    tasks: TaskWithChildren[],
    view: TaskView,
    lookups: TaskLookups,
): TaskWithChildren[] {
    const visibleTasks = view.hideOverdue
        ? tasks.filter((task) => !isTaskOverdue(task))
        : tasks;
    return sortTasks(visibleTasks, view.sort, lookups);
}
