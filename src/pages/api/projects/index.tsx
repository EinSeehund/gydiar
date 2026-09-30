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
                "SELECT * FROM projects ORDER BY id",
            );
            res.status(200).json({ success: true, projects: result.rows });
        } catch (error) {
            console.error("DB connection error:", error);
            res.status(500).json({
                success: false,
                error: "Internal server error",
            });
        }
    } else if (req.method === "POST") {
        try {
            await pool.query(
                `
                INSERT INTO "public"."projects" ("name", "completed_at", "slug", "description")
                VALUES ($1, $2, $3, $4)
                `,
                [
                    req.body.name,
                    req.body.completed_at,
                    slugify(req.body.name),
                    req.body.description,
                ],
            );
            res.status(201).json({
                success: true,
                message: "Project successfully created",
            });
        } catch (error) {
            console.error("DB connection error:", error);
            res.status(500).json({
                success: false,
                error: "Internal server error",
            });
        }
    } else {
        res.status(405).json({ success: false, error: "Method Not Allowed" });
    }
}
