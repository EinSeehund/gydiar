import type { NextPage } from "next";
import Head from "next/head";
import { SubmitEvent, useState, type JSX } from "react";
import styled from "styled-components";
import TaskCalendar from "../../components/TaskCalendar/TaskCalendar";
import { useTasks } from "@/lib/hooks/useTasks";
import { useCategories } from "@/lib/hooks/useCategories";
import { Task } from "@/types/task";
import Modal from "../../components/Modal/Modal";
import TaskForm from "../../components/TaskForm/TaskForm";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

type TaskWithChildren = Task & { children: Task[] };

const CalendarPage: NextPage = (): JSX.Element => {
    const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
    const [selectedTask, setSelectedTask] = useState<TaskWithChildren | null>(
        null,
    );
    const [defaultDueDate, setDefaultDueDate] = useState<string>("");

    const {
        data: tasksFetch,
        error: tasksError,
        isLoading: tasksIsLoading,
        mutate: mutateTasks,
        addTask,
        addSubTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        updateTaskDueDate,
    } = useTasks();

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

    function withChildren(task: Task, all: Task[]): TaskWithChildren {
        return {
            ...task,
            children: all.filter((t) => t.parent_task_id === task.id),
        };
    }

    function openEditTaskForm(taskId: number): void {
        const task = tasksInDb.find((t) => t.id === taskId);
        if (!task) return;
        setSelectedTask(withChildren(task, tasksInDb));
        setShowTaskForm(true);
    }

    function openNewTaskForm(date: string): void {
        setSelectedTask(null);
        setDefaultDueDate(date);
        setShowTaskForm(true);
    }

    function closeTaskForm(): void {
        setSelectedTask(null);
        setDefaultDueDate("");
        setShowTaskForm(false);
    }

    async function refreshUI(): Promise<void> {
        const refreshed = await mutateTasks();
        if (selectedTask && refreshed) {
            const updated = refreshed.tasks.find(
                (t) => t.id === selectedTask.id,
            );
            if (updated)
                setSelectedTask(withChildren(updated, refreshed.tasks));
        }
    }

    async function handleNewTask(
        event: SubmitEvent<HTMLFormElement>,
    ): Promise<void> {
        await addTask(event);
        await mutateTasks();
    }
    async function handleNewSubTask(
        event: SubmitEvent<HTMLFormElement>,
        parentTaskId: number,
    ): Promise<void> {
        await addSubTask(event, parentTaskId);
        await refreshUI();
    }
    async function handleUpdateTask(
        event: SubmitEvent<HTMLFormElement>,
        id: number,
    ): Promise<void> {
        await updateTask(event, id);
        await refreshUI();
    }
    async function handleDeleteTask(id: number): Promise<void> {
        await deleteTask(id);
        await refreshUI();
    }
    async function handleUpdateTaskStatus(
        id: number,
        newStatus: "open" | "done",
    ): Promise<void> {
        await updateTaskStatus(id, newStatus);
        await refreshUI();
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
            {showTaskForm && (
                <Modal>
                    <TaskForm
                        task={selectedTask}
                        defaultValues={{ defaultDueDate }}
                        onSubmit={
                            selectedTask
                                ? (event) =>
                                      handleUpdateTask(event, selectedTask.id)
                                : handleNewTask
                        }
                        onCancel={closeTaskForm}
                        onDelete={handleDeleteTask}
                        onCloseForm={closeTaskForm}
                        onCheckboxChange={handleUpdateTaskStatus}
                        onSubmitSubTask={handleNewSubTask}
                        onUpdateSubTask={handleUpdateTask}
                        isEditing={selectedTask !== null}
                    />
                </Modal>
            )}
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
