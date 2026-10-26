import type { NextPage } from "next";
import Head from "next/head";
import { type JSX, useState } from "react";
import { format } from "date-fns";
import styled from "styled-components";
import TaskCalendar from "../../components/TaskCalendar/TaskCalendar";
import { useTasks } from "@/lib/hooks/useTasks";
import { useCategories } from "@/lib/hooks/useCategories";
import useTaskEditor from "@/lib/hooks/useTaskEditor";
import { useRoutines } from "@/lib/hooks/useRoutines";
import { useRoutineOccurrences } from "@/lib/hooks/useRoutineOccurrences";
import useRoutineEditor from "@/lib/hooks/useRoutineEditor";
import { useTaskView } from "@/lib/hooks/useTaskView";
import TaskEditorModal from "../../components/TaskEditorModal/TaskEditorModal";
import RoutineEditorModal from "../../components/RoutineEditorModal/RoutineEditorModal";
import HideRoutinesToggle from "../../components/HideRoutinesToggle/HideRoutinesToggle";
import { withChildren } from "@/lib/tasks";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

const CalendarPage: NextPage = (): JSX.Element => {
    const tasksApi = useTasks();
    const {
        data: tasksFetch,
        error: tasksError,
        isLoading: tasksIsLoading,
        mutate: mutateTasks,
        updateTaskDueDate,
    } = tasksApi;
    const editor = useTaskEditor(tasksApi);

    // Set by the calendar's datesSet once it knows the visible range.
    const [range, setRange] = useState<{ from: string; to: string } | null>(
        null,
    );
    const today = format(new Date(), "yyyy-MM-dd");
    // Not part of the loading check below: unmounting the calendar while
    // occurrences load would re-trigger datesSet.
    const { data: occurrencesFetch } = useRoutineOccurrences(
        range ? { ...range, today } : null,
    );
    // Only needed to open the editor, so the page doesn't wait for it.
    const routinesApi = useRoutines();
    const routineEditor = useRoutineEditor(routinesApi);
    // Same stored preference as the "Hide routines" toggle in task lists.
    const { view, setHideRoutines } = useTaskView();

    const {
        data: categoriesFetch,
        error: categoriesError,
        isLoading: categoriesIsLoading,
    } = useCategories();

    if (tasksIsLoading || categoriesIsLoading) return <LoadingSpinner />;
    if (tasksError || categoriesError) return <p>Failed to load tasks.</p>;

    const tasksInDb = tasksFetch?.tasks ?? [];
    const categoriesInDb = categoriesFetch?.categories ?? [];
    const rootTasks = tasksInDb.filter((task) => task.parent_task_id === null);
    const occurrencesInDb = occurrencesFetch?.occurrences ?? [];
    const visibleOccurrences = view.hideRoutines ? [] : occurrencesInDb;

    function handleRangeChange(from: string, to: string): void {
        if (range?.from !== from || range?.to !== to) {
            setRange({ from, to });
        }
    }

    function openEditTaskForm(taskId: number): void {
        const task = tasksInDb.find((t) => t.id === taskId);
        if (!task) return;
        editor.openEditTaskForm(withChildren(task, tasksInDb));
    }

    function openNewTaskForm(date: string): void {
        editor.openNewTaskForm({ defaultDueDate: date });
    }

    async function handleTaskDrop(
        taskId: number,
        newDate: string,
    ): Promise<boolean> {
        const ok = await updateTaskDueDate(taskId, newDate);
        await mutateTasks();
        return ok;
    }

    return (
        <>
            <Head>
                <title>GYDIAR! - Calendar</title>
            </Head>
            <TaskEditorModal editor={editor} />
            <RoutineEditorModal editor={routineEditor} />
            <main>
                <Container>
                    <StyledPageTitle>Calendar</StyledPageTitle>
                    {occurrencesInDb.length > 0 && (
                        <ToggleRow>
                            <HideRoutinesToggle
                                hidden={view.hideRoutines}
                                hiddenCount={occurrencesInDb.length}
                                onChange={setHideRoutines}
                            />
                        </ToggleRow>
                    )}
                    <TaskCalendar
                        tasks={rootTasks}
                        routineOccurrences={visibleOccurrences}
                        categories={categoriesInDb}
                        onTaskClick={openEditTaskForm}
                        onRoutineClick={routineEditor.openEditRoutineForm}
                        onRangeChange={handleRangeChange}
                        onDateClick={openNewTaskForm}
                        onTaskDrop={handleTaskDrop}
                    />
                </Container>
            </main>
        </>
    );
};

export default CalendarPage;

const Container = styled.div`
    padding: 30px 64px;

    @media screen and (max-width: 600px) {
        padding: 20px;
    }

    @media screen and (min-width: 601px) and (max-width: 992px) {
        padding: 30px 30px 0 0;
    }
`;

const StyledPageTitle = styled.h2`
    margin-bottom: 32px;
`;

const ToggleRow = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;

    @media screen and (max-width: 600px) {
        justify-content: flex-start;
    }
`;
