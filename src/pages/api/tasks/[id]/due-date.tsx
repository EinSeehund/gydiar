import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { parseDueDate } from "@/lib/validation";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "PATCH") {
        return res
            .status(405)
            .json({ success: false, error: "Method not allowed" });
    }

    const { id } = req.query;

    let dueDate: string | null | undefined;

    try {
        dueDate = parseDueDate(req.body?.due_date);
    } catch {
        return res
            .status(400)
            .json({ success: false, error: "Invalid due date" });
    }

    if (dueDate === undefined) {
        res.status(400).json({ success: false, error: "due_date is required" });
    }

    try {
        const result = await pool.query(
            `UPDATE "public"."tasks"
            SET "due_date" = $1
            WHERE "id" = $2`,
            [dueDate, id],
        );

        if (result.rowCount === 0) {
            return res
                .status(404)
                .json({ success: false, error: "Task not found" });
        }

        res.status(200).json({
            success: true,
            message: "Due date successfully updated",
        });
    } catch (error) {
        res.status(500).json({ success: false, error: String(error) });
    }
}
