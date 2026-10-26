import useSWR from "swr";
import { addDays, parseISO, startOfDay } from "date-fns";
import type { RoutineOccurrence } from "@/types/routine";
import { responseError } from "./useRoutines";

type OccurrencesResponse = {
    success: boolean;
    occurrences: RoutineOccurrence[];
};

type OccurrenceFilter =
    | { due: string }
    | { from: string; to: string; today: string };

function buildUrl(filter: OccurrenceFilter): string {
    if ("due" in filter) {
        // The local day's bounds, so "completed today" follows the user's
        // time zone rather than the database's.
        const dayStart = startOfDay(parseISO(filter.due));
        const dayEnd = addDays(dayStart, 1);
        return `/api/routines/occurrences?due=${encodeURIComponent(filter.due)}&day_start=${encodeURIComponent(dayStart.toISOString())}&day_end=${encodeURIComponent(dayEnd.toISOString())}`;
    }
    return `/api/routines/occurrences?from=${encodeURIComponent(filter.from)}&to=${encodeURIComponent(filter.to)}&today=${encodeURIComponent(filter.today)}`;
}

const fetcher = (url: string) => fetch(url).then((response) => response.json());

/** Pass null to skip fetching (e.g. before the calendar knows its range). */
export function useRoutineOccurrences(filter: OccurrenceFilter | null) {
    const { data, error, isLoading, mutate } = useSWR<OccurrencesResponse>(
        filter ? buildUrl(filter) : null,
        fetcher,
    );

    async function setOccurrenceDone(
        routineId: number,
        occurrenceDate: string,
        done: boolean,
    ): Promise<void> {
        const response = await fetch(`/api/routines/${routineId}/completion`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ occurrence_date: occurrenceDate, done }),
        });
        const error = await responseError(response);
        await mutate();
        // A checkbox has nowhere to show an inline message.
        if (error) window.alert(error);
    }

    return {
        data,
        error,
        isLoading,
        mutate,
        setOccurrenceDone,
    };
}
