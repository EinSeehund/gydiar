import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import slugify from "slugify";
import { requireUser } from "@/lib/session";
import { isUniqueViolation } from "@/lib/db-helpers";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const user = await requireUser(req, res);
    if (!user) return;

    if (req.method === "GET") {
        try {
            const result = await pool.query(
                "SELECT * FROM categories WHERE user_id = $1 ORDER BY id",
                [user.id],
            );
            return res
                .status(200)
                .json({ success: true, categories: result.rows });
        } catch (error) {
            console.error("DB error:", error);
            return res
                .status(500)
                .json({ success: false, error: "Internal server error" });
        }
    } else if (req.method === "POST") {
        const rawName = req.body?.name;

        if (typeof rawName !== "string" || !rawName.trim()) {
            return res
                .status(400)
                .json({ success: false, error: "Name is required" });
        }

        const name = rawName.trim();

        try {
            await pool.query(
                `
                INSERT INTO "public"."categories" ("name", "color", "slug", "user_id")
                VALUES ($1, $2, $3, $4)
            `,
                [name, req.body.color, slugify(name), user.id],
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