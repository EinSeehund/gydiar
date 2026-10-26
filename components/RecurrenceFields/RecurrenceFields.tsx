import { useState } from "react";
import styled from "styled-components";
import type { RecurrenceFreq, RecurrenceRule } from "@/types/routine";
import {
    describeRecurrence,
    LAST_DAY_OF_MONTH,
    maxDaysInMonth,
    MONTH_NAMES,
} from "@/lib/recurrence";
import { MAX_RECURRENCE_INTERVAL, recurrenceError } from "@/lib/validation";

type Props = {
    value: RecurrenceRule;
    onChange: (rule: RecurrenceRule) => void;
    // Preselected when switching to weekly / monthly (taken from the start date).
    // Yearly rules default to today's month and day instead.
    defaultWeekday: number;
    defaultMonthDay: number;
};

type MonthDayMode = "beginning" | "end" | "custom";

function monthDayMode(monthDay: number | null): MonthDayMode {
    if (monthDay === 1) return "beginning";
    if (monthDay === LAST_DAY_OF_MONTH) return "end";
    return "custom";
}

const UNIT_OPTIONS: { value: RecurrenceFreq; label: string }[] = [
    { value: "day", label: "Days" },
    { value: "week", label: "Weeks" },
    { value: "month", label: "Months" },
    { value: "year", label: "Years" },
];

const WEEKDAYS = [
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
    { value: 7, label: "Sun" },
];

export default function RecurrenceFields({
    value,
    onChange,
    defaultWeekday,
    defaultMonthDay,
}: Props) {
    // Kept separately so "Custom day" stays selected while typing, even 1.
    const [mode, setMode] = useState<MonthDayMode>(() =>
        monthDayMode(value.month_day),
    );

    // Yearly rules default to today's month and day.
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();
    const defaultDay = value.freq === "year" ? todayDay : defaultMonthDay;

    function changeFreq(freq: RecurrenceFreq): void {
        const monthDay =
            freq === "month" ? defaultMonthDay : freq === "year" ? todayDay : null;
        if (monthDay !== null) setMode(monthDayMode(monthDay));
        onChange({
            ...value,
            freq,
            weekdays: freq === "week" ? [defaultWeekday] : null,
            month_day: monthDay,
            year_month: freq === "year" ? todayMonth : null,
        });
    }

    function changeMode(newMode: MonthDayMode): void {
        setMode(newMode);
        const customDay =
            value.year_month !== null
                ? Math.min(defaultDay, maxDaysInMonth(value.year_month))
                : defaultDay;
        const monthDay = {
            beginning: 1,
            end: LAST_DAY_OF_MONTH,
            custom: customDay,
        }[newMode];
        onChange({ ...value, month_day: monthDay });
    }

    function changeYearMonth(yearMonth: number): void {
        // Keep a custom day valid for the new month (e.g. 31 -> April 30).
        const monthDay =
            value.month_day !== null && value.month_day !== LAST_DAY_OF_MONTH
                ? Math.min(value.month_day, maxDaysInMonth(yearMonth))
                : value.month_day;
        onChange({ ...value, year_month: yearMonth, month_day: monthDay });
    }

    function toggleWeekday(weekday: number): void {
        const current = value.weekdays ?? [];
        const weekdays = current.includes(weekday)
            ? current.filter((day) => day !== weekday)
            : [...current, weekday].sort((a, b) => a - b);
        onChange({ ...value, weekdays });
    }

    const error = recurrenceError(value);
    const customDay =
        mode === "custom" && value.month_day !== null ? value.month_day : NaN;
    const isYearly = value.freq === "year";
    const maxCustomDay =
        isYearly && value.year_month !== null
            ? maxDaysInMonth(value.year_month)
            : 31;
    let clampNote: string | null = null;
    if (mode === "custom" && !error) {
        if (isYearly && value.year_month === 2 && customDay === 29) {
            clampNote =
                "In years without February 29, the routine falls on February 28.";
        } else if (!isYearly && customDay > 28) {
            clampNote = `In months with fewer than ${customDay} days, the routine moves to the last day of the month.`;
        }
    }

    return (
        <StyledFieldset>
            <legend>Repeat</legend>
            <IntervalRow>
                <label htmlFor="recurrence-interval">Every</label>
                <IntervalInput
                    id="recurrence-interval"
                    type="number"
                    min={1}
                    max={MAX_RECURRENCE_INTERVAL}
                    required
                    value={Number.isNaN(value.interval) ? "" : value.interval}
                    onChange={(event) =>
                        onChange({
                            ...value,
                            interval: event.target.valueAsNumber,
                        })
                    }
                />
                <StyledSelect
                    aria-label="Unit"
                    value={value.freq}
                    onChange={(event) =>
                        changeFreq(event.target.value as RecurrenceFreq)
                    }
                >
                    {UNIT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </StyledSelect>
            </IntervalRow>
            {value.freq === "week" && (
                <WeekdayRow role="group" aria-label="Weekdays">
                    {WEEKDAYS.map((weekday) => {
                        const selected =
                            value.weekdays?.includes(weekday.value) ?? false;
                        return (
                            <WeekdayChip
                                key={weekday.value}
                                type="button"
                                aria-pressed={selected}
                                $selected={selected}
                                onClick={() => toggleWeekday(weekday.value)}
                            >
                                {weekday.label}
                            </WeekdayChip>
                        );
                    })}
                </WeekdayRow>
            )}
            {isYearly && (
                <IntervalRow>
                    <label htmlFor="recurrence-year-month">In</label>
                    <StyledSelect
                        id="recurrence-year-month"
                        value={value.year_month ?? todayMonth}
                        onChange={(event) =>
                            changeYearMonth(Number(event.target.value))
                        }
                    >
                        {MONTH_NAMES.map((name, index) => (
                            <option key={name} value={index + 1}>
                                {name}
                            </option>
                        ))}
                    </StyledSelect>
                </IntervalRow>
            )}
            {(value.freq === "month" || isYearly) && (
                <MonthDayGroup role="radiogroup" aria-label="Day of month">
                    <RadioLabel>
                        <input
                            type="radio"
                            name="month_day_mode"
                            checked={mode === "beginning"}
                            onChange={() => changeMode("beginning")}
                        />
                        Beginning of the month
                    </RadioLabel>
                    <RadioLabel>
                        <input
                            type="radio"
                            name="month_day_mode"
                            checked={mode === "end"}
                            onChange={() => changeMode("end")}
                        />
                        End of the month
                    </RadioLabel>
                    <RadioLabel>
                        <input
                            type="radio"
                            name="month_day_mode"
                            checked={mode === "custom"}
                            onChange={() => changeMode("custom")}
                        />
                        Custom day
                        {mode === "custom" && (
                            <DayInput
                                type="number"
                                aria-label="Day of month"
                                min={1}
                                max={maxCustomDay}
                                required
                                value={Number.isNaN(customDay) ? "" : customDay}
                                onChange={(event) =>
                                    onChange({
                                        ...value,
                                        month_day: event.target.valueAsNumber,
                                    })
                                }
                            />
                        )}
                    </RadioLabel>
                    {clampNote && <ClampNote>{clampNote}</ClampNote>}
                </MonthDayGroup>
            )}
            <Summary aria-live="polite" $error={error !== null}>
                {error ?? describeRecurrence(value)}
            </Summary>
        </StyledFieldset>
    );
}

const StyledFieldset = styled.fieldset`
    width: 100%;
    border: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const IntervalRow = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const IntervalInput = styled.input`
    width: 72px;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #bdbdbd;
    font-size: 1rem;
    font-family: inherit;
`;

const StyledSelect = styled.select`
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #bdbdbd;
    font-size: 1rem;
`;

const WeekdayRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
`;

const WeekdayChip = styled.button<{ $selected: boolean }>`
    min-width: 44px;
    padding: 6px 8px;
    border-radius: 16px;
    border: 1px solid var(--foreground);
    font-size: 0.85rem;
    cursor: pointer;
    background: ${({ $selected }) =>
        $selected ? "var(--foreground)" : "var(--background)"};
    color: ${({ $selected }) =>
        $selected ? "var(--background)" : "var(--foreground)"};
`;

const MonthDayGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const RadioLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const DayInput = styled.input`
    width: 64px;
    padding: 4px 8px;
    border-radius: 8px;
    border: 1px solid #bdbdbd;
    font-size: 1rem;
    font-family: inherit;
`;

const ClampNote = styled.p`
    font-size: 0.85rem;
    color: gray;
`;

const Summary = styled.p<{ $error: boolean }>`
    font-size: 0.9rem;
    color: ${({ $error }) => ($error ? "#c0392b" : "gray")};
`;
