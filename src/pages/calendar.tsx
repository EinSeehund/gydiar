import type { NextPage } from "next";
import Head from "next/head";
import { type JSX } from "react";
import styled from "styled-components";
import TaskCalendar from "../../components/TaskCalendar/TaskCalendar";
import { useTasks } from "@/lib/hooks/useTasks";
import { useCategories } from "@/lib/hooks/useCategories";
import useTaskEditor from "@/lib/hooks/useTaskEditor";
import TaskEditorModal from "../../components/TaskEditorModal/TaskEditorModal";
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
            <main>
                <Container>
                    <StyledPageTitle>Calendar</StyledPageTitle>
                    <TaskCalendar
                        tasks={rootTasks}
                        categories={categoriesInDb}
                        onTaskClick={openEditTaskForm}
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
