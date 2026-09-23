import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { id } = req.query;

    if (req.method === "PUT") {
        try {
            await pool.query(
                `
                UPDATE "public"."tasks"
                SET "title" = $1
                WHERE "id" = $2`,
                [req.body.taskTitle, id],
            );
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
