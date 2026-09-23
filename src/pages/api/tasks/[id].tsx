import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { id } = req.query;

    const rawTitle = req.body?.taskTitle;

    if (typeof rawTitle !== "string" || !rawTitle.trim()) {
        return res.status(400).json({
            success: false,
            error: "Task title is required",
        });
    }

    const title = rawTitle.trim();

    if (req.method === "PUT") {
        try {
            const result = await pool.query(
                `
                UPDATE "public"."tasks"
                SET "title" = $1
                WHERE "id" = $2`,
                [title, id],
            );

            if (result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Task not found",
                });
            }
            
            res.status(200).json({
                success: true,
                message: "Task successfully updated",
            });
        } catch (error) {
            console.error("DB connection error:", error);
            res.status(500).json({ success: false, error: String(error) });
        }
    } else {
        res.status(405).json({ success: false, error: "Method Not Allowed" });
    }
}
