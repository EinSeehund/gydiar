import styled from "styled-components";
import type { Task } from "@/types/task";
import SubTaskListItem from "../SubTaskListItem/SubTaskListItem";

type SubTaskListProps = {
    subTasks: Task[];
    onCheckboxChange: (id: number, newStatus: "open" | "done") => void;
    onTitleClick: (task: Task) => void;
};

export default function SubTaskList({
    subTasks,
    onCheckboxChange,
    onTitleClick,
}: SubTaskListProps) {
    return (
        <SubTaskListWrapper>
            <SubTaskListOpen>
                {subTasks
                    .filter((subTask) => subTask.status === "open")
                    .map((subTask) => (
                        <SubTaskListItem
                            key={subTask.id}
                            subTask={subTask}
                            onCheckboxChange={onCheckboxChange}
                            onTitleClick={onTitleClick}
                        />
                    ))}
            </SubTaskListOpen>
            <SubTaskListDone>
                {subTasks
                    .filter((subTask) => subTask.status === "done")
                    .map((subTask) => (
                        <SubTaskListItem
                            key={subTask.id}
                            subTask={subTask}
                            onCheckboxChange={onCheckboxChange}
                            onTitleClick={onTitleClick}
                        />
                    ))}
            </SubTaskListDone>
        </SubTaskListWrapper>
    );
}

const SubTaskListWrapper = styled.section`
    border-left: 1px dashed gray;
    margin: 16px 0 16px 32px;
    padding: 0 0 0 16px;
`;

const SubTaskListOpen = styled.ul`
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 16px;
`;

const SubTaskListDone = styled.ul`
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 16px;

    > li,
    > li > button {
        color: gray;
        text-decoration: line-through;
    }

    input[type="checkbox"] {
        accent-color: gray;
    }
`;
