export function parseDueDate(value: unknown): string | null | undefined {
    if (value === undefined) return undefined; // Feld wurde nicht mitgeschickt
    if (value === null || value === "") return null; // Deadline entfernen
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new Error("Ungültiges Datum");
    }
    return value;
}
