import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    try {
        const result = await pool.query("SELECT * FROM tasks");
        res.status(200).json({ success: true, tasks: result.rows });
    } catch (error) {
        console.error("DB connection error:", error);
        res.status(500).json({ success: false, error: String(error) });
    }
}
