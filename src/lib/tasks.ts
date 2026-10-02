import type { Task, TaskWithChildren } from "@/types/task";

export function withChildren(task: Task, allTasks: Task[]): TaskWithChildren {
    return {
        ...task,
        children: allTasks.filter((t) => t.parent_task_id === task.id),
    };
}