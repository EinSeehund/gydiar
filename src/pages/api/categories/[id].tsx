import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { requireUser } from "@/lib/session";
import { isUniqueViolation } from "@/lib/db-helpers";
import { parseText, parseColor, MAX_CATEGORY_NAME_LENGTH } from "@/lib/validation";
import { getOrCreateDataKey, encryptField, hashField } from "@/lib/crypto";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const user = await requireUser(req, res);
    if (!user) return;

    const { id } = req.query;
    if (typeof id !== "string") {
        return res.status(400).json({ success: false, error: "Invalid id" });
    }

    if (req.method === "PUT") {
        let name: string;
        let color: string | null;
        try {
            name = parseText(req.body?.name, MAX_CATEGORY_NAME_LENGTH, "Title");
            color = parseColor(req.body?.color) ?? null;
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : "Invalid input",
            });
        }

        try {
            const dataKey = await getOrCreateDataKey(user.id);
            const result = await pool.query(
                `
                UPDATE "public"."categories"
                SET "name" = $1, "color" = $2, "name_hash" = $3
                WHERE "id" = $4 AND "user_id" = $5`,
                [
                    encryptField(name, dataKey),
                    color,
                    hashField(name, dataKey),
                    id,
                    user.id,
                ],
            );

            if (result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Category not found",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Category successfully updated",
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
    } else if (req.method === "DELETE") {
        try {
            const result = await pool.query(
                `
                DELETE FROM "public"."categories"
                WHERE "id" = $1 AND "user_id" = $2`,
                [id, user.id],
            );

            if (result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Category not found",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Category successfully deleted",
            });
        } catch (error) {
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