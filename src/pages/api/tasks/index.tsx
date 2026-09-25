import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method === "GET") {
        try {
            const result = await pool.query("SELECT * FROM tasks ORDER BY id");
            res.status(200).json({ success: true, tasks: result.rows });
        } catch (error) {
            console.error("DB connection error:", error);
            res.status(500).json({ success: false, error: String(error) });
        }
    } else if (req.method === "POST") {
        try {
            await pool.query(
                `
                INSERT INTO "public"."tasks" ("title", "parent_task_id")
                VALUES ($1, $2)
            `,
                [req.body.taskTitle, req.body.parent_task_id],
            );
            res.status(200).json({
                success: true,
                message: "Task successfully created",
            });
        } catch (error) {
            console.error("DB connection error:", error);
            res.status(500).json({ success: false, error: String(error) });
        }
    } else {
        res.status(405).json({ success: false, error: "Method Not Allowed" });
    }
}
