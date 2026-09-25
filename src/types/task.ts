export type Task = {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    status: string;
    parent_task_id: number | null;
};
