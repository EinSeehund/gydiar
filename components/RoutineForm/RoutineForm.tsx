import { type SubmitEvent, useState } from "react";
import styled from "styled-components";
import { format, getDate, getISODay, parseISO } from "date-fns";
import type { RecurrenceRule, Routine, RoutinePayload } from "@/types/routine";
import { useCategories } from "@/lib/hooks/useCategories";
import { MAX_TASK_TITLE_LENGTH, recurrenceError } from "@/lib/validation";
import RecurrenceFields from "../RecurrenceFields/RecurrenceFields";
import ButtonPrimary from "../ButtonPrimary/ButtonPrimary";
import ButtonSecondary from "../ButtonSecondary/ButtonSecondary";
import ButtonTertiary from "../ButtonTertiary/ButtonTertiary";
import CharCount from "../CharCount/CharCount";

type Props = {
    routine: Routine | null;
    // Both resolve to the API's error message, or null on success.
    onSubmit: (payload: RoutinePayload) => Promise<string | null>;
    onCancel: () => void;
    onDelete: (id: number) => Promise<string | null>;
};

const DEFAULT_RULE: RecurrenceRule = {
    freq: "day",
    interval: 1,
    weekdays: null,
    month_day: null,
    year_month: null,
};

export default function RoutineForm({
    routine,
    onSubmit,
    onCancel,
    onDelete,
}: Props) {
    const {
        data: CategoriesFetch,
        error: CategoriesError,
        isLoading: CategoriesIsLoading,
    } = useCategories();

    const [title, setTitle] = useState(routine?.title ?? "");
    const [categoryId, setCategoryId] = useState<number | null>(
        routine?.category_id ?? null,
    );
    const [anchorDate, setAnchorDate] = useState(
        routine?.anchor_date ?? format(new Date(), "yyyy-MM-dd"),
    );
    const [rule, setRule] = useState<RecurrenceRule>(
        routine
            ? {
                  freq: routine.freq,
                  interval: routine.interval,
                  weekdays: routine.weekdays,
                  month_day: routine.month_day,
                  year_month: routine.year_month,
              }
            : DEFAULT_RULE,
    );
    // null until the user picks one: the choice is deliberately not preselected.
    const [keepOpen, setKeepOpen] = useState<boolean | null>(
        routine?.keep_open ?? null,
    );
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    if (CategoriesIsLoading) return <p>Loading...</p>;
    if (CategoriesError) return <p>Failed to load categories.</p>;

    const categoriesInDb = CategoriesFetch?.categories ?? [];
    const anchor = anchorDate ? parseISO(anchorDate) : new Date();
    const isRuleValid = recurrenceError(rule) === null;

    // Stays open on failure so the input isn't lost.
    async function finish(action: Promise<string | null>): Promise<void> {
        setIsSaving(true);
        const error = await action;
        setIsSaving(false);
        if (error) {
            setSubmitError(error);
        } else {
            onCancel();
        }
    }

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!isRuleValid || keepOpen === null || !title.trim() || !anchorDate) {
            return;
        }
        await finish(
            onSubmit({
                title: title.trim(),
                category_id: categoryId,
                anchor_date: anchorDate,
                keep_open: keepOpen,
                ...rule,
            }),
        );
    }

    async function handleDelete(id: number) {
        if (
            window.confirm(
                "Delete this routine? All of its occurrences will be removed.",
            )
        ) {
            await finish(onDelete(id));
        }
    }

    return (
        <>
            <Headline>{routine ? "Edit Routine" : "Add New Routine"}</Headline>
            {routine && (
                <Note>Changes apply to all occurrences of this routine.</Note>
            )}
            <StyledForm onSubmit={handleSubmit}>
                <FormItemWrapper>
                    <label htmlFor="routineTitle">Title</label>
                    <StyledInput
                        id="routineTitle"
                        type="text"
                        autoFocus={!routine}
                        value={title}
                        required
                        maxLength={MAX_TASK_TITLE_LENGTH}
                        onChange={(event) => setTitle(event.target.value)}
                    />
                    <CharCount
                        current={title.length}
                        max={MAX_TASK_TITLE_LENGTH}
                    />
                </FormItemWrapper>
                <FormItemWrapper>
                    <label htmlFor="routine-category-select">Category</label>
                    <StyledSelect
                        id="routine-category-select"
                        value={categoryId ?? ""}
                        onChange={(event) =>
                            setCategoryId(
                                event.target.value === ""
                                    ? null
                                    : Number(event.target.value),
                            )
                        }
                    >
                        <option value={""}>None</option>
                        {categoriesInDb.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </StyledSelect>
                </FormItemWrapper>
                <FormItemWrapper>
                    <label htmlFor="anchor_date">Start Date</label>
                    <StyledInput
                        type="date"
                        id="anchor_date"
                        required
                        value={anchorDate}
                        onChange={(event) => setAnchorDate(event.target.value)}
                    />
                </FormItemWrapper>
                <RecurrenceFields
                    value={rule}
                    onChange={setRule}
                    defaultWeekday={getISODay(anchor)}
                    defaultMonthDay={getDate(anchor)}
                />
                <StyledFieldset>
                    <legend>If not done on its date</legend>
                    <RadioLabel>
                        <input
                            type="radio"
                            name="keep_open"
                            required
                            checked={keepOpen === true}
                            onChange={() => setKeepOpen(true)}
                        />
                        Keep it open until checked
                    </RadioLabel>
                    <RadioLabel>
                        <input
                            type="radio"
                            name="keep_open"
                            checked={keepOpen === false}
                            onChange={() => setKeepOpen(false)}
                        />
                        Dismiss it automatically
                    </RadioLabel>
                </StyledFieldset>
                {submitError && <ErrorText role="alert">{submitError}</ErrorText>}
                <ButtonContainer>
                    <ButtonPrimary
                        text={routine ? "Update" : "Create"}
                        type="submit"
                        disabled={!isRuleValid || isSaving}
                    />
                    <ButtonSecondary
                        text="Cancel"
                        type="button"
                        onClick={onCancel}
                    />
                </ButtonContainer>
                {routine && (
                    <ButtonTertiary
                        text={null}
                        type="button"
                        onClick={() => handleDelete(routine.id)}
                    />
                )}
            </StyledForm>
        </>
    );
}

const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;

    @media screen and (max-width: 600px) {
        gap: 24px;
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 16px;
`;

const StyledInput = styled.input`
    width: 100%;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #bdbdbd;
    font-size: 1rem;
    font-family: inherit;
`;

const FormItemWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const StyledSelect = styled.select`
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #bdbdbd;
    font-size: 1rem;
`;

const StyledFieldset = styled.fieldset`
    border: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const RadioLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const Headline = styled.h2`
    margin-bottom: 16px;
`;

const ErrorText = styled.p`
    color: #c0392b;
    font-size: 0.9rem;
`;

const Note = styled.p`
    margin-bottom: 16px;
    font-size: 0.9rem;
    color: gray;
`;
