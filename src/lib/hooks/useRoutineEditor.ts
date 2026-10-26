import { useState } from "react";
import { useSWRConfig } from "swr";
import type { RoutinesApi } from "./useRoutines";
import type { Routine, RoutinePayload } from "@/types/routine";

export default function useRoutineEditor({
    data,
    addRoutine,
    updateRoutine,
    deleteRoutine,
}: RoutinesApi) {
    const { mutate } = useSWRConfig();
    const [showRoutineForm, setShowRoutineForm] = useState<boolean>(false);
    const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(
        null,
    );

    function openNewRoutineForm(): void {
        setSelectedRoutine(null);
        setShowRoutineForm(true);
    }

    function openEditRoutineForm(routineId: number): void {
        const routine = data?.routines.find((r) => r.id === routineId);
        if (!routine) return;
        setSelectedRoutine(routine);
        setShowRoutineForm(true);
    }

    function closeRoutineForm(): void {
        setSelectedRoutine(null);
        setShowRoutineForm(false);
    }

    // Refreshes the routine list and every cached occurrence range.
    async function refreshRoutines(): Promise<void> {
        await mutate(
            (key) => typeof key === "string" && key.startsWith("/api/routines"),
        );
    }

    /** Resolves to the API's error message, or null once saved. */
    async function handleSaveRoutine(
        payload: RoutinePayload,
    ): Promise<string | null> {
        const error = selectedRoutine
            ? await updateRoutine(selectedRoutine.id, payload)
            : await addRoutine(payload);
        if (!error) await refreshRoutines();
        return error;
    }

    async function handleDeleteRoutine(id: number): Promise<string | null> {
        const error = await deleteRoutine(id);
        if (!error) await refreshRoutines();
        return error;
    }

    return {
        showRoutineForm,
        selectedRoutine,
        openNewRoutineForm,
        openEditRoutineForm,
        closeRoutineForm,
        handleSaveRoutine,
        handleDeleteRoutine,
    };
}

export type RoutineEditor = ReturnType<typeof useRoutineEditor>;
