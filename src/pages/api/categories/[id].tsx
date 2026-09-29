import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { id } = req.query;

    if (req.method === "PUT") {
        const rawName = req.body?.name;

        if (typeof rawName !== "string" || !rawName.trim()) {
            return res.status(400).json({
                success: false,
                error: "Task title is required",
            });
        }

        const name = rawName.trim();

        try {
            const result = await pool.query(
                `
                UPDATE "public"."categories"
                SET "name" = $1, "color" = $2
                WHERE "id" = $3`,
                [name, req.body.color, id],
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
    } else if (req.method === "DELETE") {
        try {
            const result = await pool.query(
                `
                DELETE FROM "public"."categories"
                WHERE "id" = $1`,
                [id],
            );

            if (result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Category not found",
                });
            }

            res.status(200).json({
                success: true,
                message: "Category successfully deleted",
            });
        } catch (error) {
            console.error("DB connection error:", error);
            res.status(500).json({ success: false, error: String(error) });
        }
    } else {
        res.status(405).json({ success: false, error: "Method Not Allowed" });
    }
}
