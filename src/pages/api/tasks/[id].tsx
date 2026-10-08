import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ownsRow } from "@/lib/db-helpers";
import { parseDueDate, parseText, MAX_TASK_TITLE_LENGTH } from "@/lib/validation";

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
        let title: string;
        try {
            title = parseText(
                req.body?.taskTitle,
                MAX_TASK_TITLE_LENGTH,
                "Task title",
            );
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : "Invalid title",
            });
        }

        let dueDate: string | null;
        try {
            dueDate = parseDueDate(req.body.due_date) ?? null;
        } catch {
            return res
                .status(400)
                .json({ success: false, error: "Invalid due date" });
        }

        const category_id = req.body.category_id ?? null;
        const project_id = req.body.project_id ?? null;

        try {
            const checks = await Promise.all([
                ownsRow("categories", category_id, user.id),
                ownsRow("projects", project_id, user.id),
            ]);
            if (checks.includes(false)) {
                return res
                    .status(400)
                    .json({ success: false, error: "Invalid reference" });
            }

            const result = await pool.query(
                `
                UPDATE "public"."tasks"
                SET "title" = $1, "category_id" = $2, "project_id" = $3, "due_date" = $4
                WHERE "id" = $5 AND "user_id" = $6`,
                [title, category_id, project_id, dueDate, id, user.id],
            );

            if (result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Task not found",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Task successfully updated",
            });
        } catch (error) {
            console.error("DB error:", error);
            return res
                .status(500)
                .json({ success: false, error: "Internal server error" });
        }
    } else if (req.method === "PATCH") {
        const newStatus = req.body;

        if (!["open", "done"].includes(newStatus)) {
            return res.status(400).json({
                success: false,
                error: "Invalid status value",
            });
        }

        try {
            const result = await pool.query(
                `
                UPDATE "public"."tasks"
                SET "status" = $1
                WHERE "id" = $2 AND "user_id" = $3
                `,
                [newStatus, id, user.id],
            );

            if (result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Task not found",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Task successfully updated",
            });
        } catch (error) {
            console.error("DB error:", error);
            return res
                .status(500)
                .json({ success: false, error: "Internal server error" });
        }
    } else if (req.method === "DELETE") {
        try {
            const result = await pool.query(
                `
                DELETE FROM "public"."tasks"
                WHERE "id" = $1 AND "user_id" = $2`,
                [id, user.id],
            );

            if (result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Task not found",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Task successfully deleted",
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