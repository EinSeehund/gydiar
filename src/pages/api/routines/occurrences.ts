import type { NextApiRequest, NextApiResponse } from "next";
import { differenceInCalendarDays, parseISO } from "date-fns";
import pool from "@/lib/db";
import { requireUser } from "@/lib/session";
import { parseDueDate, parseTimestamp } from "@/lib/validation";
import { getOrCreateDataKey, decryptField } from "@/lib/crypto";
import { ROUTINE_COLUMNS } from "@/lib/routines";
import {
    isOccurrence,
    latestOccurrenceBefore,
    occurrenceStatus,
    occurrencesBetween,
} from "@/lib/recurrence";
import type { Routine, RoutineOccurrence } from "@/types/routine";

// Covers the calendar's Year view, including its leading/trailing days.
const MAX_RANGE_DAYS = 400;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const user = await requireUser(req, res);
    if (!user) return;

    if (req.method !== "GET") {
        return res
            .status(405)
            .json({ success: false, error: "Method Not Allowed" });
    }

    const { due, day_start, day_end, from, to, today } = req.query;
    if (
        Array.isArray(due) ||
        Array.isArray(day_start) ||
        Array.isArray(day_end) ||
        Array.isArray(from) ||
        Array.isArray(to) ||
        Array.isArray(today)
    ) {
        return res
            .status(400)
            .json({ success: false, error: "Invalid query parameter" });
    }

    let dueDate: string | null | undefined;
    let fromDate: string | null | undefined;
    let toDate: string | null | undefined;
    let todayDate: string | null | undefined;
    let dayStart: string | undefined;
    let dayEnd: string | undefined;
    try {
        dueDate = parseDueDate(due);
        dayStart = parseTimestamp(day_start);
        dayEnd = parseTimestamp(day_end);
        fromDate = parseDueDate(from);
        toDate = parseDueDate(to);
        todayDate = parseDueDate(today);
    } catch {
        return res.status(400).json({ success: false, error: "Invalid date" });
    }

    // ?due= mirrors GET /api/tasks?due=: that day's occurrences, the latest
    // missed keep-open occurrences, and whatever was completed that day.
    // day_start/day_end bound "that day" in the client's time zone, since
    // completed_at::date would use the database's.
    if (dueDate) {
        if (!dayStart || !dayEnd || Date.parse(dayStart) >= Date.parse(dayEnd)) {
            return res.status(400).json({
                success: false,
                error: "day_start and day_end are required with due",
            });
        }
        fromDate = dueDate;
        toDate = dueDate;
        todayDate = dueDate;
    } else if (
        !fromDate ||
        !toDate ||
        !todayDate ||
        fromDate > toDate ||
        differenceInCalendarDays(parseISO(toDate), parseISO(fromDate)) >
            MAX_RANGE_DAYS
    ) {
        return res.status(400).json({
            success: false,
            error: `due, or from, to and today are required (from <= to, at most ${MAX_RANGE_DAYS} days)`,
        });
    }

    try {
        const dataKey = await getOrCreateDataKey(user.id);
        const routineResult = await pool.query(
            `SELECT ${ROUTINE_COLUMNS} FROM routines WHERE user_id = $1`,
            [user.id],
        );
        const routines: Routine[] = routineResult.rows.map((row) => ({
            ...row,
            title: decryptField(row.title, dataKey),
        }));

        const latestMissed = new Map<number, string | null>(
            routines.map((routine) => [
                routine.id,
                routine.keep_open
                    ? latestOccurrenceBefore(
                          routine,
                          routine.anchor_date,
                          todayDate,
                      )
                    : null,
            ]),
        );
        const latestMissedDates = [...latestMissed.values()].filter(
            (date): date is string => date !== null,
        );

        const completionResult = await pool.query(
            `SELECT c.routine_id, c.occurrence_date::text AS occurrence_date,
                COALESCE(
                    c.completed_at >= $5::timestamptz AND c.completed_at < $6::timestamptz,
                    false
                ) AS completed_on_due
            FROM routine_completions c
            JOIN routines r ON r.id = c.routine_id
            WHERE r.user_id = $1
            AND (
                c.occurrence_date BETWEEN $2 AND $3
                OR c.occurrence_date = ANY($4::date[])
                OR (c.completed_at >= $5::timestamptz AND c.completed_at < $6::timestamptz)
            )`,
            [
                user.id,
                fromDate,
                toDate,
                latestMissedDates,
                dueDate ? dayStart : null,
                dueDate ? dayEnd : null,
            ],
        );
        const completed = new Set<string>(
            completionResult.rows.map(
                (row) => `${row.routine_id}|${row.occurrence_date}`,
            ),
        );

        const occurrences = new Map<string, RoutineOccurrence>();
        function add(routine: Routine, date: string): void {
            const key = `${routine.id}|${date}`;
            occurrences.set(key, {
                routine_id: routine.id,
                title: routine.title,
                category_id: routine.category_id,
                due_date: date,
                status: occurrenceStatus({
                    date,
                    completed: completed.has(key),
                    keepOpen: routine.keep_open,
                    today: todayDate as string,
                    latestMissed: latestMissed.get(routine.id) ?? null,
                }),
            });
        }

        for (const routine of routines) {
            for (const date of occurrencesBetween(
                routine,
                routine.anchor_date,
                fromDate,
                toDate,
            )) {
                add(routine, date);
            }

            if (dueDate) {
                const missed = latestMissed.get(routine.id);
                if (missed && !completed.has(`${routine.id}|${missed}`)) {
                    add(routine, missed);
                }
            }
        }

        if (dueDate) {
            // Completed today, e.g. an overdue occurrence checked off late.
            const routinesById = new Map(routines.map((r) => [r.id, r]));
            for (const row of completionResult.rows) {
                if (!row.completed_on_due) continue;
                const routine = routinesById.get(row.routine_id);
                if (
                    routine &&
                    isOccurrence(routine, routine.anchor_date, row.occurrence_date)
                ) {
                    add(routine, row.occurrence_date);
                }
            }
        }

        return res.status(200).json({
            success: true,
            occurrences: [...occurrences.values()].sort(
                (a, b) =>
                    a.due_date.localeCompare(b.due_date) ||
                    a.title.localeCompare(b.title),
            ),
        });
    } catch (error) {
        console.error("DB error:", error);
        return res
            .status(500)
            .json({ success: false, error: "Internal server error" });
    }
}
