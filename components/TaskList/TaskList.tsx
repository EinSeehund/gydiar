import type { Task } from "@/types/task";
import styled from "styled-components";
import TaskListItem from "../TaskListItem/TaskListItem";
import { useState } from "react";

type TaskListProps = {
    taskList: Task[];
    onCheckboxChange: (id: number, newStatus: "open" | "done") => void;
    onTitleClick: (task: Task) => void;
};

export default function TaskList({
    taskList,
    onCheckboxChange,
    onTitleClick,
}: TaskListProps) {
    const [showDoneTasks, setShowDoneTasks] = useState<boolean>(false);

    return (
        <TaskListWrapper>
            <TaskListOpen>
                {taskList
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
                        />
                    ))}
            </TaskListOpen>
            <StyledDetails>
                <StyledSummary>Done Tasks</StyledSummary>
                <TaskListDone>
                    {taskList
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
        accent-color: gray; /* Change to your preferred color */
    }
`;

const StyledDetails = styled.details`
    margin-bottom: 32px;
`;

const StyledSummary = styled.summary`
    font-size: 0.9rem;
`;
