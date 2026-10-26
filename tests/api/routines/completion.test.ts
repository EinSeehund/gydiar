import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
    default: { query: vi.fn() },
}));
vi.mock("@/lib/session", () => ({
    requireUser: vi.fn(),
}));

import pool from "@/lib/db";
import { requireUser } from "@/lib/session";
import handler from "@/pages/api/routines/[id]/completion";

const mockedPool = vi.mocked(pool);
const mockedRequireUser = vi.mocked(requireUser);

const user = { id: "user-1" };
const weeklyOnMonday = {
    freq: "week",
    interval: 1,
    weekdays: [1],
    month_day: null,
    year_month: null,
    anchor_date: "2026-10-19",
};

async function put(id: string, body: unknown) {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        query: { id },
        body: body as never,
    });
    await handler(req, res);
    return res._getStatusCode();
}

beforeEach(() => {
    vi.clearAllMocks();
    mockedRequireUser.mockResolvedValue(user as never);
});

describe("PUT /api/routines/[id]/completion", () => {
    it("rejects a non-numeric id without querying", async () => {
        expect(await put("abc", { occurrence_date: "2026-10-26", done: true })).toBe(400);
        expect(mockedPool.query).not.toHaveBeenCalled();
    });

    it("requires a date and a boolean done", async () => {
        expect(await put("1", { occurrence_date: "2026-10-26", done: "yes" })).toBe(400);
        expect(await put("1", { done: true })).toBe(400);
    });

    it("returns 404 for a routine the user doesn't own", async () => {
        mockedPool.query.mockResolvedValueOnce({ rows: [] } as never);
        expect(await put("1", { occurrence_date: "2026-10-26", done: true })).toBe(404);
        expect(mockedPool.query.mock.calls[0][1]).toEqual(["1", user.id]);
    });

    it("rejects dates that are not an occurrence", async () => {
        mockedPool.query.mockResolvedValueOnce({ rows: [weeklyOnMonday] } as never);
        expect(await put("1", { occurrence_date: "2026-10-27", done: true })).toBe(400);
        expect(mockedPool.query).toHaveBeenCalledTimes(1);
    });

    it("inserts a completion when done and deletes it when undone", async () => {
        mockedPool.query.mockResolvedValue({ rows: [weeklyOnMonday] } as never);

        expect(await put("1", { occurrence_date: "2026-10-26", done: true })).toBe(200);
        expect(mockedPool.query.mock.calls[1][0]).toContain("INSERT");
        expect(mockedPool.query.mock.calls[1][1]).toEqual(["1", "2026-10-26"]);

        expect(await put("1", { occurrence_date: "2026-10-26", done: false })).toBe(200);
        expect(mockedPool.query.mock.calls[3][0]).toContain("DELETE");
    });
});
