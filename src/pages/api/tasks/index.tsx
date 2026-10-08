import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { parseDueDate, parseText, MAX_TASK_TITLE_LENGTH } from "@/lib/validation";
import { requireUser } from "@/lib/session";
import { ownsRow } from "@/lib/db-helpers";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const user = await requireUser(req, res);
    if (!user) return;

    if (req.method === "GET") {
        const { category, project, due, from, to } = req.query;

        if (
            Array.isArray(category) ||
            Array.isArray(project) ||
            Array.isArray(due) ||
            Array.isArray(from) ||
            Array.isArray(to)
        ) {
            return res
                .status(400)
                .json({ success: false, error: "Invalid query parameter" });
        }

        let dueDate: string | null | undefined;
        try {
            dueDate = parseDueDate(due);
        } catch {
            return res
                .status(400)
                .json({ success: false, error: "Invalid due date" });
        }

        let fromDate: string | null | undefined;
        let toDate: string | null | undefined;
        try {
            fromDate = parseDueDate(from);
            toDate = parseDueDate(to);
        } catch {
            return res.status(400).json({ error: "Invalid date" });
        }

        if (fromDate || toDate) {
            if (!fromDate || !toDate || fromDate > toDate) {
                return res.status(400).json({
                    error: "from and to are required, from must be <= to",
                });
            }
        }

        try {
            let result;
            if (dueDate) {
                result = await pool.query(
                    `WITH due_tasks AS (
                        SELECT * FROM tasks
                        WHERE user_id = $2
                        AND (
                            due_date = $1
                            OR (due_date < $1 AND status = 'open')
                            OR (updated_at::date = NOW()::date AND status = 'done')
                        )
                    ),
                    visible_tasks AS (
                        SELECT * FROM due_tasks
                        UNION
                        SELECT child.*
                        FROM tasks child
                        JOIN due_tasks parent ON child.parent_task_id = parent.id
                        WHERE child.user_id = $2
                    )
                    SELECT id, title, created_at, updated_at, status,
                        parent_task_id, category_id, project_id,
                        due_date::text AS due_date
                    FROM visible_tasks
                    ORDER BY due_date DESC`,
                    [dueDate, user.id],
                );
            } else if (category) {
                result = await pool.query(
                    `WITH category_tasks AS (
                        SELECT t.*
                        FROM tasks t
                        JOIN categories c ON c.id = t.category_id
                        WHERE c.slug = $1 AND c.user_id = $2 AND t.user_id = $2
                    ),
                    visible_tasks AS (
                        SELECT * FROM category_tasks
                        UNION
                        SELECT child.*
                        FROM tasks child
                        JOIN category_tasks parent ON child.parent_task_id = parent.id
                        WHERE child.user_id = $2
                    )
                    SELECT id, title, created_at, updated_at, status,
                        parent_task_id, category_id, project_id,
                        due_date::text AS due_date
                    FROM visible_tasks
                    ORDER BY due_date ASC NULLS LAST, created_at DESC`,
                    [category, user.id],
                );
            } else if (from && to) {
                result = await pool.query(
                    `WITH range_tasks AS (
                        SELECT * FROM tasks WHERE due_date BETWEEN $1 AND $2 AND tasks.user_id = $3
                    ),
                    visible_tasks AS (
                        SELECT * FROM range_tasks
                        UNION
                        SELECT child.* FROM tasks child
                        JOIN range_tasks parent ON child.parent_task_id = parent.id
                        WHERE child.user_id = $3
                    )
                    SELECT id, title, created_at, updated_at, status, parent_task_id,
                        category_id, project_id, due_date::text AS due_date
                    FROM visible_tasks
                    ORDER BY due_date ASC, created_at DESC`,
                    [from, to, user.id],
                );
            } else if (project) {
                result = await pool.query(
                    `WITH project_tasks AS (
                        SELECT t.*
                        FROM tasks t
                        JOIN projects p ON p.id = t.project_id
                        WHERE p.slug = $1 AND p.user_id = $2 AND t.user_id = $2
                    ),
                    visible_tasks AS (
                        SELECT * FROM project_tasks
                        UNION
                        SELECT child.*
                        FROM tasks child
                        JOIN project_tasks parent ON child.parent_task_id = parent.id
                        WHERE child.user_id = $2
                    )
                    SELECT id, title, created_at, updated_at, status,
                        parent_task_id, category_id, project_id,
                        due_date::text AS due_date
                    FROM visible_tasks
                    ORDER BY due_date ASC NULLS LAST, created_at DESC`,
                    [project, user.id],
                );
            } else {
                result = await pool.query(
                    `SELECT id, title, created_at, updated_at, status,
                        parent_task_id, category_id, project_id,
                        due_date::text AS due_date
                    FROM tasks
                    WHERE user_id = $1
                    ORDER BY due_date ASC NULLS LAST, created_at DESC`,
                    [user.id],
                );
            }
            return res.status(200).json({ success: true, tasks: result.rows });
        } catch (error) {
            console.error("DB error:", error);
            return res
                .status(500)
                .json({ success: false, error: "Internal Server Error" });
        }
    } else if (req.method === "POST") {
        let title: string;
        let due_date: string | null;
        try {
            title = parseText(req.body.taskTitle, MAX_TASK_TITLE_LENGTH, "Task title");
            due_date = parseDueDate(req.body.due_date) ?? null;
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : "Invalid input",
            });
        }

        const parent_task_id = req.body.parent_task_id ?? null;
        const category_id = req.body.category_id ?? null;
        const project_id = req.body.project_id ?? null;

        try {
            const checks = await Promise.all([
                ownsRow("tasks", parent_task_id, user.id),
                ownsRow("categories", category_id, user.id),
                ownsRow("projects", project_id, user.id),
            ]);
            if (checks.includes(false)) {
                return res
                    .status(400)
                    .json({ success: false, error: "Invalid reference" });
            }

            await pool.query(
                `INSERT INTO "public"."tasks"
                    ("title", "parent_task_id", "category_id", "project_id", "due_date", "user_id")
                VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    title,
                    parent_task_id,
                    category_id,
                    project_id,
                    due_date,
                    user.id,
                ],
            );
            return res
                .status(200)
                .json({ success: true, message: "Task successfully created" });
        } catch (error) {
            console.error("DB error:", error);
            return res
                .status(500)
                .json({ success: false, error: "Internal Server Error" });
        }
    } else {
        return res
            .status(405)
            .json({ success: false, error: "Method Not Allowed" });
    }
}
