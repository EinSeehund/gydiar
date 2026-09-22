import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    try {
        const result = await pool.query("SELECT NOW()");
        res.status(200).json({ success: true, time: result.rows[0] });
    } catch (error) {
        console.error("DB connection error:", error);
        res.status(500).json({ success: false, error: String(error) });
    }
}
