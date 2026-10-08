import pool from "./db";
import type { Account } from "@/types/account";

export async function getAccountInfo(userId: string): Promise<Account | null> {
    const userResult = await pool.query(
        `SELECT name, email, "emailVerified" AS email_verified, "createdAt" AS created_at
         FROM "user" WHERE id = $1`,
        [userId],
    );
    if (userResult.rowCount !== 1) return null;

    const accountResult = await pool.query(
        `SELECT "providerId" AS provider_id, password IS NOT NULL AS has_password
         FROM account WHERE "userId" = $1`,
        [userId],
    );

    const providers = accountResult.rows
        .map((row) => row.provider_id as string)
        .filter((provider) => provider !== "credential");
    const hasPassword = accountResult.rows.some(
        (row) => row.provider_id === "credential" && row.has_password,
    );

    return {
        ...userResult.rows[0],
        providers,
        has_password: hasPassword,
    };
}

export async function deleteUserData(userId: string): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query("DELETE FROM tasks WHERE user_id = $1", [userId]);
        await client.query("DELETE FROM categories WHERE user_id = $1", [
            userId,
        ]);
        await client.query("DELETE FROM projects WHERE user_id = $1", [
            userId,
        ]);
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
