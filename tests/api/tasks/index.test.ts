import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_TASK_TITLE_LENGTH } from "@/lib/validation";

vi.mock("@/lib/db", () => ({
    default: { query: vi.fn() },
}));
vi.mock("@/lib/session", () => ({
    requireUser: vi.fn(),
}));
vi.mock("@/lib/db-helpers", () => ({
    ownsRow: vi.fn(),
}));

import pool from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ownsRow } from "@/lib/db-helpers";
import handler from "@/pages/api/tasks/index";

const mockedPool = vi.mocked(pool);
const mockedRequireUser = vi.mocked(requireUser);
const mockedOwnsRow = vi.mocked(ownsRow);

const user = { id: "user-1" };

function mockRequestResponse(options: Parameters<typeof createMocks>[0]) {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>(options);
    return { req, res };
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe("GET /api/tasks", () => {
    it("returns 401 without querying the database when there is no session", async () => {
        mockedRequireUser.mockResolvedValue(null);
        const { req, res } = mockRequestResponse({ method: "GET" });

        await handler(req, res);

        expect(mockedPool.query).not.toHaveBeenCalled();
    });

    it("returns the tasks for the current user on success", async () => {
        mockedRequireUser.mockResolvedValue(user as never);
        mockedPool.query.mockResolvedValue({
            rows: [{ id: 1, title: "Buy milk" }],
        } as never);
        const { req, res } = mockRequestResponse({ method: "GET" });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res._getJSONData()).toEqual({
            success: true,
            tasks: [{ id: 1, title: "Buy milk" }],
        });
    });
});

describe("POST /api/tasks", () => {
    it("returns 400 when the task title is too long", async () => {
        mockedRequireUser.mockResolvedValue(user as never);
        const { req, res } = mockRequestResponse({
            method: "POST",
            body: { taskTitle: "a".repeat(MAX_TASK_TITLE_LENGTH + 1) },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        expect(res._getJSONData()).toEqual({
            success: false,
            error: `Task title must be at most ${MAX_TASK_TITLE_LENGTH} characters`,
        });
        expect(mockedPool.query).not.toHaveBeenCalled();
    });

    it("returns 400 when a referenced category is not owned by the user", async () => {
        mockedRequireUser.mockResolvedValue(user as never);
        mockedOwnsRow.mockResolvedValue(false);
        const { req, res } = mockRequestResponse({
            method: "POST",
            body: { taskTitle: "Buy milk", category_id: 999 },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        expect(res._getJSONData()).toEqual({
            success: false,
            error: "Invalid reference",
        });
        expect(mockedPool.query).not.toHaveBeenCalled();
    });

    it("inserts the task and returns success", async () => {
        mockedRequireUser.mockResolvedValue(user as never);
        mockedOwnsRow.mockResolvedValue(true);
        mockedPool.query.mockResolvedValue({ rows: [] } as never);
        const { req, res } = mockRequestResponse({
            method: "POST",
            body: { taskTitle: "Buy milk", due_date: "2026-03-05" },
        });

        await handler(req, res);

        expect(mockedPool.query).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO"),
            ["Buy milk", null, null, null, "2026-03-05", user.id],
        );
        expect(res._getStatusCode()).toBe(200);
        expect(res._getJSONData()).toEqual({
            success: true,
            message: "Task successfully created",
        });
    });
});
