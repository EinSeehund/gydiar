import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ownsRow } from "@/lib/db-helpers";
import { getOrCreateDataKey, encryptField } from "@/lib/crypto";
import { parseRoutinePayload } from "@/lib/routines";
import type { RoutinePayload } from "@/types/routine";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const user = await requireUser(req, res);
    if (!user) return;

    const { id } = req.query;
    if (typeof id !== "string" || !/^\d+$/.test(id)) {
        return res.status(400).json({ success: false, error: "Invalid id" });
    }

    if (req.method === "PUT") {
        let routine: RoutinePayload;
        try {
            routine = parseRoutinePayload(req.body);
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : "Invalid input",
            });
        }

        try {
            if (!(await ownsRow("categories", routine.category_id, user.id))) {
                return res
                    .status(400)
                    .json({ success: false, error: "Invalid reference" });
            }

            const dataKey = await getOrCreateDataKey(user.id);
            const result = await pool.query(
                `UPDATE "public"."routines"
                SET "title" = $1, "category_id" = $2, "freq" = $3, "interval" = $4,
                    "weekdays" = $5, "month_day" = $6, "year_month" = $7,
                    "anchor_date" = $8, "keep_open" = $9
                WHERE "id" = $10 AND "user_id" = $11`,
                [
                    encryptField(routine.title, dataKey),
                    routine.category_id,
                    routine.freq,
                    routine.interval,
                    routine.weekdays,
                    routine.month_day,
                    routine.year_month,
                    routine.anchor_date,
                    routine.keep_open,
                    id,
                    user.id,
                ],
            );

            if (result.rowCount === 0) {
                return res
                    .status(404)
                    .json({ success: false, error: "Routine not found" });
            }

            return res
                .status(200)
                .json({ success: true, message: "Routine successfully updated" });
        } catch (error) {
            console.error("DB error:", error);
            return res
                .status(500)
                .json({ success: false, error: "Internal server error" });
        }
    } else if (req.method === "DELETE") {
        try {
            const result = await pool.query(
                `DELETE FROM "public"."routines" WHERE "id" = $1 AND "user_id" = $2`,
                [id, user.id],
            );

            if (result.rowCount === 0) {
                return res
                    .status(404)
                    .json({ success: false, error: "Routine not found" });
            }

            return res
                .status(200)
                .json({ success: true, message: "Routine successfully deleted" });
        } catch (error) {
            console.error("DB error:", error);
            return res
                .status(500)
                .json({ success: false, error: "Internal server error" });
        }
    } else {
        return res
            .status(405)
            .json({ success: false, error: "Method Not Allowed" });
    }
}
