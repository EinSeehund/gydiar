import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { requireUser } from "@/lib/session";
import { parseDueDate } from "@/lib/validation";
import { isOccurrence } from "@/lib/recurrence";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const user = await requireUser(req, res);
    if (!user) return;

    if (req.method !== "PUT") {
        return res
            .status(405)
            .json({ success: false, error: "Method not allowed" });
    }

    const { id } = req.query;
    if (typeof id !== "string" || !/^\d+$/.test(id)) {
        return res.status(400).json({ success: false, error: "Invalid id" });
    }

    let occurrenceDate: string | null | undefined;
    try {
        occurrenceDate = parseDueDate(req.body?.occurrence_date);
    } catch {
        return res.status(400).json({ success: false, error: "Invalid date" });
    }
    const done = req.body?.done;
    if (!occurrenceDate || typeof done !== "boolean") {
        return res.status(400).json({
            success: false,
            error: "occurrence_date and done are required",
        });
    }

    try {
        const routineResult = await pool.query(
            `SELECT freq, "interval", weekdays, month_day, year_month, anchor_date::text AS anchor_date
            FROM routines WHERE id = $1 AND user_id = $2`,
            [id, user.id],
        );
        const routine = routineResult.rows[0];
        if (!routine) {
            return res
                .status(404)
                .json({ success: false, error: "Routine not found" });
        }
        if (!isOccurrence(routine, routine.anchor_date, occurrenceDate)) {
            return res.status(400).json({
                success: false,
                error: "Date is not an occurrence of this routine",
            });
        }

        if (done) {
            await pool.query(
                `INSERT INTO "public"."routine_completions" ("routine_id", "occurrence_date")
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING`,
                [id, occurrenceDate],
            );
        } else {
            await pool.query(
                `DELETE FROM "public"."routine_completions"
                WHERE "routine_id" = $1 AND "occurrence_date" = $2`,
                [id, occurrenceDate],
            );
        }

        return res
            .status(200)
            .json({ success: true, message: "Occurrence successfully updated" });
    } catch (error) {
        console.error("DB error:", error);
        return res
            .status(500)
            .json({ success: false, error: "Internal server error" });
    }
}
