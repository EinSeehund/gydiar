import { describe, expect, it } from "vitest";
import type { TaskWithChildren } from "@/types/task";
import type { Category } from "@/types/category";
import type { Project } from "@/types/project";
import {
    applyTaskView,
    countOverdueTasks,
    sortTasks,
    type TaskLookups,
} from "./taskView";

function makeTask(overrides: Partial<TaskWithChildren>): TaskWithChildren {
    return {
        id: 1,
        title: "Task",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        status: "open",
        parent_task_id: null,
        category_id: null,
        project_id: null,
        due_date: null,
        children: [],
        ...overrides,
    };
}

const categories: Category[] = [
    { id: 1, name: "Work", color: "#ff0000", slug: "work" },
    { id: 2, name: "Home", color: "#00ff00", slug: "home" },
];

const projects: Project[] = [
    { id: 1, name: "Launch", completed_at: null, slug: "launch", description: null },
    { id: 2, name: "Archive", completed_at: null, slug: "archive", description: null },
];

const lookups: TaskLookups = { categories, projects };

describe("sortTasks", () => {
    it("sorts by date ascending, nulls last", () => {
        const a = makeTask({ id: 1, due_date: "2026-03-05" });
        const b = makeTask({ id: 2, due_date: "2026-01-01" });
        const c = makeTask({ id: 3, due_date: null });

        const result = sortTasks([a, b, c], { key: "date", direction: "asc" }, lookups);
        expect(result.map((t) => t.id)).toEqual([2, 1, 3]);
    });

    it("sorts by date descending, nulls still last", () => {
        const a = makeTask({ id: 1, due_date: "2026-03-05" });
        const b = makeTask({ id: 2, due_date: "2026-01-01" });
        const c = makeTask({ id: 3, due_date: null });

        const result = sortTasks([a, b, c], { key: "date", direction: "desc" }, lookups);
        expect(result.map((t) => t.id)).toEqual([1, 2, 3]);
    });

    it("sorts by category name, nulls last regardless of direction", () => {
        const a = makeTask({ id: 1, category_id: 2 }); // Home
        const b = makeTask({ id: 2, category_id: 1 }); // Work
        const c = makeTask({ id: 3, category_id: null });

        const asc = sortTasks([a, b, c], { key: "category", direction: "asc" }, lookups);
        expect(asc.map((t) => t.id)).toEqual([1, 2, 3]);

        const desc = sortTasks([a, b, c], { key: "category", direction: "desc" }, lookups);
        expect(desc.map((t) => t.id)).toEqual([2, 1, 3]);
    });

    it("sorts by project name, nulls last regardless of direction", () => {
        const a = makeTask({ id: 1, project_id: 2 }); // Archive
        const b = makeTask({ id: 2, project_id: 1 }); // Launch
        const c = makeTask({ id: 3, project_id: null });

        const asc = sortTasks([a, b, c], { key: "project", direction: "asc" }, lookups);
        expect(asc.map((t) => t.id)).toEqual([1, 2, 3]);
    });

    it("sorts by title", () => {
        const a = makeTask({ id: 1, title: "Zebra" });
        const b = makeTask({ id: 2, title: "Apple" });

        const result = sortTasks([a, b], { key: "title", direction: "asc" }, lookups);
        expect(result.map((t) => t.id)).toEqual([2, 1]);
    });

    it("breaks ties on the primary key by due_date before title", () => {
        // Title order alone would put b ("Apple") before a ("Zebra"); due_date
        // must win the tie-break for a to still come first.
        const a = makeTask({ id: 1, title: "Zebra", due_date: "2026-01-01" });
        const b = makeTask({ id: 2, title: "Apple", due_date: "2026-02-01" });

        const result = sortTasks([a, b], { key: "category", direction: "asc" }, lookups);
        expect(result.map((t) => t.id)).toEqual([1, 2]);
    });

    it("breaks ties on due_date by title before id", () => {
        // Id order alone would put e (id 2) before c (id 5); title must win
        // the tie-break so the "Banana" task sorts after both "Apple" tasks.
        const c = makeTask({ id: 5, title: "Apple", due_date: "2026-01-01" });
        const d = makeTask({ id: 1, title: "Apple", due_date: "2026-01-01" });
        const e = makeTask({ id: 2, title: "Banana", due_date: "2026-01-01" });

        const result = sortTasks([c, d, e], { key: "category", direction: "asc" }, lookups);
        expect(result.map((t) => t.id)).toEqual([1, 5, 2]);
    });
});

describe("countOverdueTasks / applyTaskView", () => {
    const overdueOpen = makeTask({ id: 1, due_date: "2000-01-01", status: "open" });
    const overdueDone = makeTask({ id: 2, due_date: "2000-01-01", status: "done" });
    const upcoming = makeTask({ id: 3, due_date: "2999-01-01", status: "open" });

    it("counts only overdue, open tasks", () => {
        expect(countOverdueTasks([overdueOpen, overdueDone, upcoming])).toBe(1);
    });

    it("hides overdue tasks when hideOverdue is true", () => {
        const result = applyTaskView(
            [overdueOpen, overdueDone, upcoming],
            { sort: { key: "date", direction: "asc" }, hideOverdue: true },
            lookups,
        );
        expect(result.map((t) => t.id).sort()).toEqual([2, 3]);
    });

    it("keeps overdue tasks when hideOverdue is false", () => {
        const result = applyTaskView(
            [overdueOpen, overdueDone, upcoming],
            { sort: { key: "date", direction: "asc" }, hideOverdue: false },
            lookups,
        );
        expect(result.map((t) => t.id).sort()).toEqual([1, 2, 3]);
    });
});
