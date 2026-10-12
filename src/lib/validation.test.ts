import { describe, expect, it } from "vitest";
import {
    MAX_TASK_TITLE_LENGTH,
    parseColor,
    parseDueDate,
    parseOptionalText,
    parseText,
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
