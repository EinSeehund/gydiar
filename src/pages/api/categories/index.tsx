import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { requireUser } from "@/lib/session";
import { isUniqueViolation } from "@/lib/db-helpers";
import { parseText, parseColor, MAX_CATEGORY_NAME_LENGTH } from "@/lib/validation";
import {
    getOrCreateDataKey,
    encryptField,
    decryptField,
    hashField,
    generateSlug,
} from "@/lib/crypto";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const user = await requireUser(req, res);
    if (!user) return;

    if (req.method === "GET") {
        try {
            const dataKey = await getOrCreateDataKey(user.id);
            const result = await pool.query(
                "SELECT id, name, color, slug FROM categories WHERE user_id = $1 ORDER BY id",
                [user.id],
            );
            return res.status(200).json({
                success: true,
                categories: result.rows.map((row) => ({
                    ...row,
                    name: decryptField(row.name, dataKey),
                })),
            });
        } catch (error) {
            console.error("DB error:", error);
            return res
                .status(500)
                .json({ success: false, error: "Internal server error" });
        }
    } else if (req.method === "POST") {
        let name: string;
        let color: string | null;
        try {
            name = parseText(req.body?.name, MAX_CATEGORY_NAME_LENGTH, "Name");
            color = parseColor(req.body?.color) ?? null;
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : "Invalid input",
            });
        }

        try {
            const dataKey = await getOrCreateDataKey(user.id);
            await pool.query(
                `
                INSERT INTO "public"."categories" ("name", "color", "slug", "name_hash", "user_id")
                VALUES ($1, $2, $3, $4, $5)
            `,
                [
                    encryptField(name, dataKey),
                    color,
                    generateSlug(),
                    hashField(name, dataKey),
                    user.id,
                ],
            );
            return res.status(200).json({
                success: true,
                message: "Category successfully created",
            });
        } catch (error) {
            if (isUniqueViolation(error)) {
                return res.status(409).json({
                    success: false,
                    error: "A category with this name already exists",
                });
            }
            console.error("DB error:", error);
            return res
                .status(500)
                .json({ success: false, error: "Internal server error" });
        }
    } else {
        return res
            .status(405)
            .json({ success: false, error: "Method Not Allowed" });
    }
}