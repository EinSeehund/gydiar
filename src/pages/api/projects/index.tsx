import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import slugify from "slugify";
import { requireUser } from "@/lib/session";
import { isUniqueViolation } from "@/lib/db-helpers";
import {
    parseText,
    parseOptionalText,
    parseDueDate,
    MAX_PROJECT_NAME_LENGTH,
    MAX_DESCRIPTION_LENGTH,
} from "@/lib/validation";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const user = await requireUser(req, res);
    if (!user) return;

    if (req.method === "GET") {
        try {
            const result = await pool.query(
                "SELECT * FROM projects WHERE user_id = $1 ORDER BY id",
                [user.id],
            );
            return res
                .status(200)
                .json({ success: true, projects: result.rows });
        } catch (error) {
            console.error("DB error:", error);
            return res
                .status(500)
                .json({ success: false, error: "Internal server error" });
        }
    } else if (req.method === "POST") {
        let name: string;
        let description: string | null;
        let completed_at: string | null;
        try {
            name = parseText(req.body?.name, MAX_PROJECT_NAME_LENGTH, "Name");
            description =
                parseOptionalText(req.body?.description, MAX_DESCRIPTION_LENGTH) ??
                null;
            completed_at = parseDueDate(req.body?.completed_at) ?? null;
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : "Invalid input",
            });
        }

        try {
            await pool.query(
                `
                INSERT INTO "public"."projects" ("name", "completed_at", "slug", "description", "user_id")
                VALUES ($1, $2, $3, $4, $5)
                `,
                [name, completed_at, slugify(name), description, user.id],
            );
            return res.status(201).json({
                success: true,
                message: "Project successfully created",
            });
        } catch (error) {
            if (isUniqueViolation(error)) {
                return res.status(409).json({
                    success: false,
                    error: "A project with this name already exists",
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