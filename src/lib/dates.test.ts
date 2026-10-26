import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatDueDate, isOverdue } from "./dates";

describe("formatDueDate", () => {
    it("formats a yyyy-MM-dd string as dd.MM.yy", () => {
        expect(formatDueDate("2026-03-05")).toBe("05.03.26");
    });
});

describe("isOverdue", () => {
    beforeEach(() => {
        vi.setSystemTime(new Date("2026-03-10T12:00:00Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns true for a past due date that is still open", () => {
        expect(isOverdue("2026-03-01", "open")).toBe(true);
    });

    it("returns false for a past due date that is done", () => {
        expect(isOverdue("2026-03-01", "done")).toBe(false);
    });

    it("returns false for a past routine occurrence that was missed", () => {
        expect(isOverdue("2026-03-01", "missed")).toBe(false);
    });

    it("returns false when there is no due date", () => {
        expect(isOverdue(null, "open")).toBe(false);
    });

    it("returns false for a future due date", () => {
        expect(isOverdue("2026-03-20", "open")).toBe(false);
    });

    it("returns false for today's due date", () => {
        expect(isOverdue("2026-03-10", "open")).toBe(false);
    });
});
