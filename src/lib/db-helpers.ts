import pool from "./db";

export async function ownsRow(
    table: "tasks" | "categories" | "projects",
    id: unknown,
    userId: string,
) {
    if (id === null || id === undefined) return true; 
    const result = await pool.query(
        `SELECT 1 FROM ${table} WHERE id = $1 AND user_id = $2`,
        [id, userId],
    );
    return result.rowCount === 1;
}


export function isUniqueViolation(error: unknown) {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505"
    );
}