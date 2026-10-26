import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ownsRow } from "@/lib/db-helpers";
import { getOrCreateDataKey, encryptField, decryptField } from "@/lib/crypto";
import { parseRoutinePayload, ROUTINE_COLUMNS } from "@/lib/routines";
import type { RoutinePayload } from "@/types/routine";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const user = await requireUser(req, res);
    if (!user) return;

    if (req.method === "GET") {
        try {
            const dataKey = await getOrCreateDataKey(user.id);
            const result = await pool.query(
                `SELECT ${ROUTINE_COLUMNS} FROM routines WHERE user_id = $1 ORDER BY id`,
                [user.id],
            );
            return res.status(200).json({
                success: true,
                routines: result.rows.map((row) => ({
                    ...row,
                    title: decryptField(row.title, dataKey),
                })),
            });
        } catch (error) {
            console.error("DB error:", error);
            return res
                .status(500)
                .json({ success: false, error: "Internal server error" });
        }
    } else if (req.method === "POST") {
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
            await pool.query(
                `INSERT INTO "public"."routines"
                    ("title", "category_id", "freq", "interval", "weekdays", "month_day", "year_month", "anchor_date", "keep_open", "user_id")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
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
                    user.id,
                ],
            );
            return res
                .status(200)
                .json({ success: true, message: "Routine successfully created" });
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
