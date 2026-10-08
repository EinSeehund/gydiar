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
export const MAX_TASK_TITLE_LENGTH = 200;
export const MAX_CATEGORY_NAME_LENGTH = 100; // categories.name is varchar(100)
export const MAX_PROJECT_NAME_LENGTH = 150; // projects.name is varchar(150)
export const MAX_DESCRIPTION_LENGTH = 5000;

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
