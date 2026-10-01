import useSWR from "swr";
import type { Task } from "@/types/task";
import { SubmitEvent } from "react";

type TasksResponse = {
    success: boolean;
    tasks: Task[];
};

type TaskFilter = {
    category?: string;
    project?: string;
};

function buildUrl(filter?: TaskFilter): string {
    if (filter?.category) {
        return `/api/tasks?category=${encodeURIComponent(filter.category)}`;
    }
    if (filter?.project) {
        return `/api/tasks?project=${encodeURIComponent(filter.project)}`;
    }
    return "/api/tasks";
}

const fetcher = (url: string) => fetch(url).then((response) => response.json());

export function useTasks(filter?: TaskFilter) {
    const url = buildUrl(filter);

    const { data, error, isLoading, mutate } = useSWR<TasksResponse>(
        url,
        fetcher,
    );

    async function addTask(event: SubmitEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formObject = Object.fromEntries(formData.entries());
        const taskTitle = formObject.taskTitle;
        if (typeof taskTitle !== "string" || !taskTitle.trim()) {
            return;
        }

        const payload = {
            ...formObject,
            category_id:
                formObject.category_id === "" ? null : formObject.category_id,
            project_id:
                formObject.project_id === "" ? null : formObject.project_id,
        };

        const response = await fetch("/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            return;
        }
    }
    async function addSubTask(
        event: SubmitEvent<HTMLFormElement>,
        parentTaskId: number,
    ): Promise<void> {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formObject = Object.fromEntries(formData.entries());
        const taskTitle = formObject.taskTitle;

        if (typeof taskTitle !== "string" || !taskTitle.trim()) {
            return;
        }

        const payload = {
            taskTitle,
            parent_task_id: parentTaskId,
        };

        const response = await fetch("/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            return;
        }
    }
    async function updateTask(
        event: SubmitEvent<HTMLFormElement>,
        id: number,
    ): Promise<void> {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formObject = Object.fromEntries(formData.entries());
        const taskTitle = formObject.taskTitle;
        if (typeof taskTitle !== "string" || !taskTitle.trim()) {
            return;
        }

        const payload = {
            ...formObject,
            category_id:
                formObject.category_id === "" ? null : formObject.category_id,
        };

        const response = await fetch(`/api/tasks/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            return;
        }
    }
    async function deleteTask(id: number): Promise<void> {
        const response = await fetch(`/api/tasks/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            return;
        }
    }
    async function updateTaskStatus(
        id: number,
        newStatus: "open" | "done",
    ): Promise<void> {
        const response = await fetch(`/api/tasks/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newStatus),
        });

        if (!response.ok) {
            return;
        }
    }

    return {
        data,
        error,
        isLoading,
        mutate,
        addTask,
        addSubTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
    };
}
