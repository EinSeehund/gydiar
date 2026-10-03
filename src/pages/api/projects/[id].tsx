import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { requireUser } from "@/lib/session";

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
        const rawName = req.body?.name;

        if (typeof rawName !== "string" || !rawName.trim()) {
            return res.status(400).json({
                success: false,
                error: "Title is required",
            });
        }

        const name = rawName.trim();

        try {
            const result = await pool.query(
                `
                UPDATE "public"."projects"
                SET "name" = $1, "completed_at" = $2, "description" = $3
                WHERE "id" = $4 AND "user_id" = $5`,
                [
                    name,
                    req.body.completed_at,
                    req.body.description,
                    id,
                    user.id,
                ],
            );

            if (result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Project not found",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Project successfully updated",
            });
        } catch (error) {
            console.error("DB error:", error);
            return res.status(500).json({
                success: false,
                error: "Internal server error",
            });
        }
    } else if (req.method === "DELETE") {
        try {
            const result = await pool.query(
                `
                DELETE FROM "public"."projects"
                WHERE "id" = $1 AND "user_id" = $2`,
                [id, user.id],
            );

            if (result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Project not found",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Project successfully deleted",
            });
        } catch (error) {
            console.error("DB error:", error);
            return res.status(500).json({
                success: false,
                error: "Internal server error",
            });
        }
    } else {
        return res
            .status(405)
            .json({ success: false, error: "Method Not Allowed" });
    }
}