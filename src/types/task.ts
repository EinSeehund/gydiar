export type Task = {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    status: string;
    parent_task_id: number | null;
    category_id: number | null;
    project_id: number | null;
    due_date: string | null;
};

export type TaskWithChildren = Task & {
    children: Task[];
};

export type TaskFormDefaults = {
    defaultCategory?: number | "";
    defaultProject?: number | null;
    defaultDueDate?: string;
};