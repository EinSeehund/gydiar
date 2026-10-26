import styled from "styled-components";
import { IoRepeat } from "react-icons/io5";
import type { Routine } from "@/types/routine";
import type { Category } from "@/types/category";
import { describeRecurrence } from "@/lib/recurrence";

import {
    CategoryTag,
    ListItem,
    TitleAndProject,
    TitleWrapper,
} from "../TaskListItem/TaskListItem";

type Props = {
    routines: Routine[];
    categories: Category[];
    onTitleClick: (routineId: number) => void;
};

export default function RoutineList({
    routines,
    categories,
    onTitleClick,
}: Props) {
    if (routines.length === 0) {
        return <NoRoutinesText>There are no routines yet...</NoRoutinesText>;
    }

    return (
        <StyledList>
            {routines.map((routine) => {
                const category = categories.find(
                    (c) => c.id === routine.category_id,
                );
                return (
                    <ListItem key={routine.id}>
                        <TitleWrapper>
                            <RepeatIcon aria-hidden="true" />
                            <TitleAndProject>
                                <button onClick={() => onTitleClick(routine.id)}>
                                    {routine.title}
                                </button>
                            </TitleAndProject>
                            {category && (
                                <CategoryTag $color={category.color}>
                                    {category.name}
                                </CategoryTag>
                            )}
                        </TitleWrapper>
                        <Details>
                            {describeRecurrence(routine)} ·{" "}
                            {routine.keep_open
                                ? "stays open until checked"
                                : "dismissed automatically"}
                        </Details>
                    </ListItem>
                );
            })}
        </StyledList>
    );
}

const StyledList = styled.ul`
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 32px;
`;

const RepeatIcon = styled(IoRepeat)`
    flex-shrink: 0;
    margin: 3px 16px 0 0;
    opacity: 0.6;
`;

const Details = styled.span`
    display: block;
    font-size: small;
    padding-left: 32px;
    color: gray;
`;

const NoRoutinesText = styled.p`
    padding-left: 28px;
`;
