import type { Task, TaskWithChildren } from "@/types/task";
import type { Category } from "@/types/category";
import type { Project } from "@/types/project";
import type { RoutineOccurrence } from "@/types/routine";
import { type SubmitEvent } from "react";
import styled from "styled-components";
import TaskListItem from "../TaskListItem/TaskListItem";
import RoutineOccurrenceItem from "../RoutineOccurrenceItem/RoutineOccurrenceItem";
import TaskSortPanel from "../TaskSortPanel/TaskSortPanel";
import { useMemo } from "react";
import { useTaskView } from "@/lib/hooks/useTaskView";
import {
    applyTaskView,
    countOverdueTasks,
    countRoutines,
    entryKey,
    type ListEntry,
    type SortKey,
} from "@/lib/taskView";

type TaskListProps = {
    taskList: Task[];
    routineOccurrences?: RoutineOccurrence[];
    categories: Category[];
    categoriesVisible: boolean;
    projects: Project[];
    projectsVisible: boolean;
    allowHideOverdueFilter: boolean;
    onCheckboxChange: (id: number, newStatus: "open" | "done") => void;
    onTitleClick: (task: TaskWithChildren) => void;
    onSubmitSubTask: (
        event: SubmitEvent<HTMLFormElement>,
        parentTaskId: number,
    ) => void;
    onDelete: (id: number) => void;
    onUpdateSubTask: (event: SubmitEvent<HTMLFormElement>, id: number) => void;
    onRoutineCheckboxChange?: (
        routineId: number,
        date: string,
        done: boolean,
    ) => void;
    onRoutineTitleClick?: (routineId: number) => void;
};

export default function TaskList({
    taskList,
    routineOccurrences = [],
    categories,
    categoriesVisible,
    projects,
    projectsVisible,
    allowHideOverdueFilter,
    onCheckboxChange,
    onTitleClick,
    onSubmitSubTask,
    onDelete,
    onUpdateSubTask,
    onRoutineCheckboxChange = () => {},
    onRoutineTitleClick = () => {},
}: TaskListProps) {
    const entries: ListEntry[] = useMemo<ListEntry[]>(() => {
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

        return [
            ...rootTasks.map(
                (task): ListEntry => ({
                    kind: "task",
                    task: { ...task, children: childrenMap.get(task.id) ?? [] },
                }),
            ),
            ...routineOccurrences.map(
                (occurrence): ListEntry => ({ kind: "routine", occurrence }),
            ),
        ];
    }, [taskList, routineOccurrences]);

    const { view, setSort, setHideOverdue, setHideRoutines } = useTaskView({
        allowHideOverdueFilter,
    });
    const sortedEntries = applyTaskView(entries, view, {
        categories,
        projects,
    });
    const overdueCount = countOverdueTasks(entries);
    const routineCount = countRoutines(entries);

    // Sorting by a column that is hidden (e.g. category on a category page) is pointless.
    const availableSortKeys: SortKey[] = [
        "date",
        ...(categoriesVisible ? (["category"] as const) : []),
        ...(projectsVisible ? (["project"] as const) : []),
        "title",
    ];

    function findCategory(categoryId: number | null) {
        if (categoryId) {
            const foundCategory = categories.find(
                (category) => category.id === categoryId,
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

    function isOpen(entry: ListEntry): boolean {
        return entry.kind === "task"
            ? entry.task.status === "open"
            : entry.occurrence.status === "open";
    }

    // Missed routine occurrences are no longer actionable, so they sit with
    // the done tasks.
    function isDone(entry: ListEntry): boolean {
        return entry.kind === "task"
            ? entry.task.status === "done"
            : entry.occurrence.status !== "open";
    }

    function renderEntry(entry: ListEntry) {
        if (entry.kind === "routine") {
            return (
                <RoutineOccurrenceItem
                    key={entryKey(entry)}
                    occurrence={entry.occurrence}
                    category={findCategory(entry.occurrence.category_id)}
                    categoryVisible={categoriesVisible}
                    onCheckboxChange={onRoutineCheckboxChange}
                    onTitleClick={onRoutineTitleClick}
                />
            );
        }
        const { task } = entry;
        return (
            <TaskListItem
                key={entryKey(entry)}
                task={task}
                category={findCategory(task.category_id)}
                categoryVisible={categoriesVisible}
                project={findProject(task)}
                projectVisible={projectsVisible}
                onCheckboxChange={onCheckboxChange}
                onTitleClick={onTitleClick}
                onSubmitSubTask={onSubmitSubTask}
                onDelete={onDelete}
                onUpdateSubTask={onUpdateSubTask}
            />
        );
    }

    const hasNoTasks = entries.length === 0;
    const hasDoneTasks = sortedEntries.some(isDone);

    return (
        <TaskListWrapper>
            {hasNoTasks && (
                <NoTasksText>
                    There are no tasks in this list yet...
                </NoTasksText>
            )}
            {!hasNoTasks && (
                <TaskSortPanel
                    sort={view.sort}
                    onChange={setSort}
                    availableKeys={availableSortKeys}
                    hideOverdue={
                        allowHideOverdueFilter ? view.hideOverdue : undefined
                    }
                    onHideOverdueChange={
                        allowHideOverdueFilter ? setHideOverdue : undefined
                    }
                    overdueCount={
                        allowHideOverdueFilter ? overdueCount : undefined
                    }
                    hideRoutines={routineCount > 0 ? view.hideRoutines : undefined}
                    onHideRoutinesChange={
                        routineCount > 0 ? setHideRoutines : undefined
                    }
                    routineCount={routineCount > 0 ? routineCount : undefined}
                />
            )}
            <TaskListOpen>
                {sortedEntries.filter(isOpen).map(renderEntry)}
            </TaskListOpen>
            {hasDoneTasks && (
                <StyledDetails>
                    <StyledSummary>Done Tasks</StyledSummary>
                    <TaskListDone>
                        {sortedEntries.filter(isDone).map(renderEntry)}
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
