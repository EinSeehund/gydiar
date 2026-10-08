import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { requireUser } from "@/lib/session";
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

    const { id } = req.query;
    if (typeof id !== "string") {
        return res.status(400).json({ success: false, error: "Invalid id" });
    }

    if (req.method === "PUT") {
        let name: string;
        let description: string | null;
        let completed_at: string | null;
        try {
            name = parseText(req.body?.name, MAX_PROJECT_NAME_LENGTH, "Title");
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
            const result = await pool.query(
                `
                UPDATE "public"."projects"
                SET "name" = $1, "completed_at" = $2, "description" = $3
                WHERE "id" = $4 AND "user_id" = $5`,
                [name, completed_at, description, id, user.id],
            );

            if (result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Project not found",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Project successfully updated",
            });
        } catch (error) {
            console.error("DB error:", error);
            return res.status(500).json({
                success: false,
                error: "Internal server error",
            });
        }
    } else if (req.method === "DELETE") {
        try {
            const result = await pool.query(
                `
                DELETE FROM "public"."projects"
                WHERE "id" = $1 AND "user_id" = $2`,
                [id, user.id],
            );

            if (result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Project not found",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Project successfully deleted",
            });
        } catch (error) {
            console.error("DB error:", error);
            return res.status(500).json({
                success: false,
                error: "Internal server error",
            });
        }
    } else {
        return res
            .status(405)
            .json({ success: false, error: "Method Not Allowed" });
    }
}