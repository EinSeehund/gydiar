import type { Task, TaskWithChildren } from "@/types/task";
import type { Category } from "@/types/category";
import type { Project } from "@/types/project";
import { type SubmitEvent } from "react";
import styled from "styled-components";
import TaskListItem from "../TaskListItem/TaskListItem";
import { useMemo } from "react";

type TaskListProps = {
    taskList: Task[];
    categories: Category[];
    categoriesVisible: boolean;
    projects: Project[];
    projectsVisible: boolean;
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
    categories,
    categoriesVisible,
    projects,
    projectsVisible,
    onCheckboxChange,
    onTitleClick,
    onSubmitSubTask,
    onDelete,
    onUpdateSubTask,
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

    function findCategory(taskObj: Task | TaskWithChildren) {
        if (taskObj.category_id) {
            const foundCategory = categories.find(
                (category) => category.id === taskObj.category_id,
            );
            if (foundCategory) {
                return foundCategory;
            }
        }
        return null;
    }

    function findProject(taskObj: Task | TaskWithChildren) {
        if (taskObj.project_id) {
            const foundProject = projects.find(
                (project) => project.id === taskObj.project_id,
            );
            if (foundProject) {
                return foundProject;
            }
        }
        return null;
    }

    const hasNoTasks = taskList.length === 0;
    const hasDoneTasks = taskList.some(
        (task) => task.status === "done" && task.parent_task_id === null,
    );

    return (
        <TaskListWrapper>
            {hasNoTasks && (
                <NoTasksText>
                    There are no tasks in this list yet...
                </NoTasksText>
            )}
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
                            category={findCategory(task)}
                            categoryVisible={categoriesVisible}
                            project={findProject(task)}
                            projectVisible={projectsVisible}
                            onCheckboxChange={onCheckboxChange}
                            onTitleClick={onTitleClick}
                            onSubmitSubTask={onSubmitSubTask}
                            onDelete={onDelete}
                            onUpdateSubTask={onUpdateSubTask}
                        />
                    ))}
            </TaskListOpen>
            {hasDoneTasks && (
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
                                        category={findCategory(task)}
                                        categoryVisible={categoriesVisible}
                                        project={findProject(task)}
                                        projectVisible={projectsVisible}
                                        onCheckboxChange={onCheckboxChange}
                                        onTitleClick={onTitleClick}
                                        onSubmitSubTask={onSubmitSubTask}
                                        onDelete={onDelete}
                                        onUpdateSubTask={onUpdateSubTask}
                                    />
                            ))}
                    </TaskListDone>
                </StyledDetails>
            )}
        </TaskListWrapper>
    );
}

const TaskListWrapper = styled.section``;

const TaskListOpen = styled.ul`
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
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
    padding-left: 28px;
`;

const NoTasksText = styled.p`
    padding-left: 28px;
`;
