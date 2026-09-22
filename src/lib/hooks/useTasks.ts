import useSWR from "swr";
import type { Task } from "@/types/task";

type TasksResponse = {
    success: boolean;
    tasks: Task[];
};

const fetcher = (url: string) =>
    fetch(url).then((response) => response.json());

export function useTasks() {
    return useSWR<TasksResponse>("/api/tasks", fetcher);
}