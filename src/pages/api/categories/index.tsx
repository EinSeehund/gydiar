import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import slugify from "slugify";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method === "GET") {
        try {
            const result = await pool.query(
                "SELECT * FROM categories ORDER BY id",
            );
            res.status(200).json({ success: true, categories: result.rows });
        } catch (error) {
            console.error("DB connection error:", error);
            res.status(500).json({ success: false, error: String(error) });
        }
    } else if (req.method === "POST") {
        try {
            await pool.query(
                `
                INSERT INTO "public"."categories" ("name", "color", "slug")
                VALUES ($1, $2, $3)
            `,
                [req.body.name, req.body.color, slugify(req.body.name)],
            );
            res.status(200).json({
                success: true,
                message: "Category successfully created",
            });
        } catch (error) {
            console.error("DB connection error:", error);
            res.status(500).json({ success: false, error: String(error) });
        }
    } else {
        res.status(405).json({ success: false, error: "Method Not Allowed" });
    }
}
