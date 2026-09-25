import type { Task } from "@/types/task";
import { type SubmitEvent } from "react";
import styled from "styled-components";
import TaskListItem from "../TaskListItem/TaskListItem";
import { useMemo } from "react";

type TaskWithChildren = Task & {
    children: Task[];
};

type TaskListProps = {
    taskList: Task[];
    onCheckboxChange: (id: number, newStatus: "open" | "done") => void;
    onTitleClick: (task: TaskWithChildren) => void;
    onSubmitSubTask: (
        event: SubmitEvent<HTMLFormElement>,
        parentTaskId: number,
    ) => void;
    onDelete: (id: number) => void;
    onUpdateSubTask: (event: SubmitEvent<HTMLFormElement>, id: number) => void;
};

export default function TaskList({
    taskList,
    onCheckboxChange,
    onTitleClick,
    onSubmitSubTask,
    onDelete,
    onUpdateSubTask
}: TaskListProps) {
    const taskTree: TaskWithChildren[] = useMemo<TaskWithChildren[]>(() => {
        const childrenMap = new Map<number, Task[]>();
        const rootTasks: Task[] = [];

        taskList.forEach((task) => {
            if (task.parent_task_id === null) {
                rootTasks.push(task);
            } else {
                const siblings: Task[] =
                    childrenMap.get(task.parent_task_id) ?? [];
                siblings.push(task);
                childrenMap.set(task.parent_task_id, siblings);
            }
        });

        return rootTasks.map((task) => ({
            ...task,
            children: childrenMap.get(task.id) ?? [],
        }));
    }, [taskList]);

    return (
        <TaskListWrapper>
            <TaskListOpen>
                {taskTree
                    .filter(
                        (task) =>
                            task.status === "open" &&
                            task.parent_task_id === null,
                    )
                    .map((task) => (
                        <TaskListItem
                            key={task.id}
                            task={task}
                            onCheckboxChange={onCheckboxChange}
                            onTitleClick={onTitleClick}
                            onSubmitSubTask={onSubmitSubTask}
                            onDelete={onDelete}
                            onUpdateSubTask={onUpdateSubTask}
                        />
                    ))}
            </TaskListOpen>
            <StyledDetails>
                <StyledSummary>Done Tasks</StyledSummary>
                <TaskListDone>
                    {taskTree
                        .filter(
                            (task) =>
                                task.status === "done" &&
                                task.parent_task_id === null,
                        )
                        .map((task) => (
                            <TaskListItem
                                key={task.id}
                                task={task}
                                onCheckboxChange={onCheckboxChange}
                                onTitleClick={onTitleClick}
                                onSubmitSubTask={onSubmitSubTask}
                                onDelete={onDelete}
                                onUpdateSubTask={onUpdateSubTask}
                            />
                        ))}
                </TaskListDone>
            </StyledDetails>
        </TaskListWrapper>
    );
}

const TaskListWrapper = styled.section``;

const TaskListOpen = styled.ul`
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
`;

const TaskListDone = styled.ul`
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-top: 16px;
    margin-bottom: 32px;

    > li,
    > li > button {
        color: gray;
        text-decoration: line-through;
    }

    input[type="checkbox"] {
        accent-color: gray;
    }
`;

const StyledDetails = styled.details`
    margin-bottom: 32px;
`;

const StyledSummary = styled.summary`
    font-size: 0.9rem;
`;
