import useSWR from "swr";
import type { Routine, RoutinePayload } from "@/types/routine";

type RoutinesResponse = {
    success: boolean;
    routines: Routine[];
};

const fetcher = (url: string) => fetch(url).then((response) => response.json());

/** null on success, otherwise the API's error message. */
export async function responseError(
    response: Response,
): Promise<string | null> {
    if (response.ok) return null;
    const body = await response.json().catch(() => null);
    return body?.error ?? "Something went wrong. Please try again.";
}

// Takes payload objects instead of submit events: the weekday chips are
// controlled state, and FormData -> Object.fromEntries keeps only one weekday.
export function useRoutines() {
    const { data, error, isLoading, mutate } = useSWR<RoutinesResponse>(
        "/api/routines",
        fetcher,
    );

    async function addRoutine(payload: RoutinePayload): Promise<string | null> {
        const response = await fetch("/api/routines", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        return responseError(response);
    }

    async function updateRoutine(
        id: number,
        payload: RoutinePayload,
    ): Promise<string | null> {
        const response = await fetch(`/api/routines/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        return responseError(response);
    }

    async function deleteRoutine(id: number): Promise<string | null> {
        const response = await fetch(`/api/routines/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        return responseError(response);
    }

    return {
        data,
        error,
        isLoading,
        mutate,
        addRoutine,
        updateRoutine,
        deleteRoutine,
    };
}

export type RoutinesApi = ReturnType<typeof useRoutines>;
