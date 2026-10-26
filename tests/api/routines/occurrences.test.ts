import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
    default: { query: vi.fn() },
}));
vi.mock("@/lib/session", () => ({
    requireUser: vi.fn(),
}));
vi.mock("@/lib/crypto", () => ({
    getOrCreateDataKey: vi.fn(),
    decryptField: vi.fn((stored) => stored),
}));

import pool from "@/lib/db";
import { requireUser } from "@/lib/session";
import handler from "@/pages/api/routines/occurrences";
import type { RoutineOccurrence } from "@/types/routine";

const mockedPool = vi.mocked(pool);
const mockedRequireUser = vi.mocked(requireUser);

const user = { id: "user-1" };
const dayStart = "2026-10-25T22:00:00.000Z";
const dayEnd = "2026-10-26T22:00:00.000Z";

// Anchored on Monday 2026-10-19; "today" in these tests is Monday 2026-10-26.
const dailyKeepOpen = {
    id: 1,
    title: "Water plants",
    category_id: null,
    freq: "day",
    interval: 1,
    weekdays: null,
    month_day: null,
    year_month: null,
    anchor_date: "2026-10-19",
    keep_open: true,
};
const dailyDismiss = { ...dailyKeepOpen, id: 2, title: "Stretch", keep_open: false };

function mockQueries(
    routines: object[],
    completions: { routine_id: number; occurrence_date: string; completed_on_due?: boolean }[] = [],
) {
    mockedPool.query
        .mockResolvedValueOnce({ rows: routines } as never)
        .mockResolvedValueOnce({
            rows: completions.map((c) => ({ completed_on_due: false, ...c })),
        } as never);
}

async function get(query: Record<string, string>) {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query,
    });
    await handler(req, res);
    return {
        status: res._getStatusCode(),
        body: res._getJSONData() as { occurrences: RoutineOccurrence[] },
    };
}

beforeEach(() => {
    vi.clearAllMocks();
    mockedRequireUser.mockResolvedValue(user as never);
});

describe("GET /api/routines/occurrences", () => {
    it("requires day_start and day_end with due", async () => {
        const { status } = await get({ due: "2026-10-26" });
        expect(status).toBe(400);
        expect(mockedPool.query).not.toHaveBeenCalled();
    });

    it("rejects malformed day bounds", async () => {
        const { status } = await get({
            due: "2026-10-26",
            day_start: "2026-10-26",
            day_end: dayEnd,
        });
        expect(status).toBe(400);
    });

    it("rejects ranges longer than 400 days", async () => {
        const { status } = await get({
            from: "2026-01-01",
            to: "2027-03-01",
            today: "2026-10-26",
        });
        expect(status).toBe(400);
    });

    it("scopes queries to the user and passes the local day bounds", async () => {
        mockQueries([dailyKeepOpen]);
        await get({ due: "2026-10-26", day_start: dayStart, day_end: dayEnd });

        expect(mockedPool.query.mock.calls[0][1]).toEqual([user.id]);
        const params = mockedPool.query.mock.calls[1][1] as unknown[];
        expect(params[0]).toBe(user.id);
        expect(params.slice(4)).toEqual([dayStart, dayEnd]);
    });

    it("shows today plus only the latest missed occurrence of keep-open routines in Today", async () => {
        mockQueries([dailyKeepOpen, dailyDismiss]);
        const { status, body } = await get({
            due: "2026-10-26",
            day_start: dayStart,
            day_end: dayEnd,
        });

        expect(status).toBe(200);
        expect(body.occurrences).toEqual([
            expect.objectContaining({ routine_id: 1, due_date: "2026-10-25", status: "open" }),
            expect.objectContaining({ routine_id: 2, due_date: "2026-10-26", status: "open" }),
            expect.objectContaining({ routine_id: 1, due_date: "2026-10-26", status: "open" }),
        ]);
    });

    it("includes occurrences completed during the local day as done", async () => {
        mockQueries(
            [dailyKeepOpen],
            [{ routine_id: 1, occurrence_date: "2026-10-25", completed_on_due: true }],
        );
        const { body } = await get({
            due: "2026-10-26",
            day_start: dayStart,
            day_end: dayEnd,
        });

        expect(body.occurrences).toContainEqual(
            expect.objectContaining({ routine_id: 1, due_date: "2026-10-25", status: "done" }),
        );
    });

    it("assigns open, done and missed statuses in range mode", async () => {
        mockQueries(
            [dailyKeepOpen, dailyDismiss],
            [{ routine_id: 2, occurrence_date: "2026-10-24" }],
        );
        const { body } = await get({
            from: "2026-10-23",
            to: "2026-10-27",
            today: "2026-10-26",
        });

        const status = (id: number, date: string) =>
            body.occurrences.find(
                (o) => o.routine_id === id && o.due_date === date,
            )?.status;
        // Keep open: only the latest missed (10-25) stays open.
        expect(status(1, "2026-10-24")).toBe("missed");
        expect(status(1, "2026-10-25")).toBe("open");
        // Dismiss: past ones are missed unless completed.
        expect(status(2, "2026-10-24")).toBe("done");
        expect(status(2, "2026-10-25")).toBe("missed");
        expect(status(2, "2026-10-27")).toBe("open");
    });
});
