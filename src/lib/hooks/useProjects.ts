import useSWR from "swr";
import { SubmitEvent } from "react";
import type { Project } from "@/types/project";

type ProjectResponse = {
    success: boolean;
    projects: Project[];
};

const fetcher = (url: string) => fetch(url).then((response) => response.json());

export function useProjects() {
    const { data, error, isLoading, mutate } = useSWR<ProjectResponse>(
        "/api/projects",
        fetcher,
    );

    async function addProject(
        event: SubmitEvent<HTMLFormElement>,
    ): Promise<void> {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formObject = Object.fromEntries(formData.entries());

        const newProjectName = formObject.name;
        if (typeof newProjectName !== "string" || !newProjectName.trim()) {
            return;
        }
        const response = await fetch("/api/projects", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formObject),
        });

        if (!response.ok) {
            return;
        }
    }

    async function updateProject(
        event: SubmitEvent<HTMLFormElement>,
        id: number,
    ): Promise<void> {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formObject = Object.fromEntries(formData.entries());

        const newProjectName = formObject.name;
        if (typeof newProjectName !== "string" || !newProjectName.trim()) {
            return;
        }
        const response = await fetch(`/api/projects/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formObject),
        });

        if (!response.ok) {
            return;
        }
    }

    async function deleteProject(id: number): Promise<void> {
        const response = await fetch(`/api/projects/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
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
        addProject,
        updateProject,
        deleteProject,
    };
}
