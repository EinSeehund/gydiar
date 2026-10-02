import { SubmitEvent, useState } from "react";
import { TasksApi } from "./useTasks";
import { TaskFormDefaults, TaskWithChildren } from "@/types/task";
import { withChildren } from "../tasks";

export default function useTaskEditor({
    mutate,
    addTask,
    addSubTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
}: TasksApi) {
    const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
    const [selectedTask, setSelectedTask] = useState<TaskWithChildren | null>(
        null,
    );
    const [newTaskDefaults, setNewTaskDefaults] = useState<TaskFormDefaults>(
        {},
    );

    function openNewTaskForm(defaults: TaskFormDefaults = {}): void {
        setSelectedTask(null);
        setNewTaskDefaults(defaults);
        setShowTaskForm(true);
    }

    function openEditTaskForm(task: TaskWithChildren): void {
        setSelectedTask(task);
        setShowTaskForm(true);
    }

    function closeTaskForm(): void {
        setSelectedTask(null);
        setNewTaskDefaults({});
        setShowTaskForm(false);
    }

    async function refreshUI(): Promise<void> {
        const refreshedData = await mutate();

        if (selectedTask && refreshedData) {
            const updatedTask = refreshedData.tasks.find(
                (task) => task.id === selectedTask.id,
            );

            if (updatedTask) {
                setSelectedTask(withChildren(updatedTask, refreshedData.tasks));
            }
        }
    }

    async function handleNewTask(
        event: SubmitEvent<HTMLFormElement>,
    ): Promise<void> {
        await addTask(event);
        await mutate();
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

    return {
        showTaskForm,
        selectedTask,
        newTaskDefaults,
        openNewTaskForm,
        openEditTaskForm,
        closeTaskForm,
        handleNewTask,
        handleNewSubTask,
        handleUpdateTask,
        handleDeleteTask,
        handleUpdateTaskStatus,
    };
}

export type TaskEditor = ReturnType<typeof useTaskEditor>;