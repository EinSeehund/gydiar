import { useMemo } from "react";
import styled from "styled-components";
import { format, subDays } from "date-fns";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import multiMonthPlugin from "@fullcalendar/react/multimonth";
import interactionPlugin from "@fullcalendar/react/interaction";
import themePlugin from "@fullcalendar/react/themes/classic";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";
import type { Task } from "@/types/task";
import type { Category } from "@/types/category";
import type { RoutineOccurrence } from "@/types/routine";

type TaskCalendarProps = {
    tasks: Task[];
    routineOccurrences: RoutineOccurrence[];
    categories: Category[];
    onTaskClick: (taskId: number) => void;
    onRoutineClick: (routineId: number) => void;
    onDateClick: (date: string) => void;
    onTaskDrop: (taskId: number, newDate: string) => Promise<boolean>;
    onRangeChange: (from: string, to: string) => void;
};

export default function TaskCalendar({
    tasks,
    routineOccurrences,
    categories,
    onTaskClick,
    onRoutineClick,
    onDateClick,
    onTaskDrop,
    onRangeChange,
}: TaskCalendarProps) {
    const events = useMemo(() => {
        function categoryColor(categoryId: number | null): string {
            return (
                categories.find((category) => category.id === categoryId)
                    ?.color ?? "#232323"
            );
        }

        const taskEvents = tasks
            .filter((task) => task.due_date !== null)
            .map((task) => ({
                id: String(task.id),
                title: task.title,
                start: task.due_date as string,
                allDay: true,
                color: categoryColor(task.category_id),
                className: task.status === "done" ? "task-done" : "",
                extendedProps: { kind: "task" },
            }));

        // Routine occurrences are computed from a rule, so they can't be moved.
        const routineEvents = routineOccurrences.map((occurrence) => ({
            id: `routine-${occurrence.routine_id}-${occurrence.due_date}`,
            title: `↻ ${occurrence.title}`,
            start: occurrence.due_date,
            allDay: true,
            editable: false,
            color: categoryColor(occurrence.category_id),
            className:
                occurrence.status === "done"
                    ? "task-done"
                    : occurrence.status === "missed"
                      ? "routine-missed"
                      : "",
            extendedProps: { kind: "routine", routineId: occurrence.routine_id },
        }));

        return [...taskEvents, ...routineEvents];
    }, [tasks, routineOccurrences, categories]);

    return (
        <CalendarWrapper>
            <FullCalendar
                plugins={[
                    themePlugin,
                    dayGridPlugin,
                    multiMonthPlugin,
                    interactionPlugin,
                ]}
                initialView="dayGridMonth"
                headerToolbarClass="task-calendar-toolbar"
                headerToolbar={{
                    start: "title",
                    end: "today prev,next dayGridDay,dayGridWeek,dayGridMonth,multiMonthYear",
                }}
                buttons={{
                    dayGridDay: { text: "Day" },
                    dayGridWeek: { text: "Week" },
                    dayGridMonth: { text: "Month" },
                    multiMonthYear: { text: "Year" },
                }}
                firstDay={1}
                height="auto"
                events={events}
                editable={true}
                eventClick={(info) => {
                    if (info.event.extendedProps.kind === "routine") {
                        onRoutineClick(info.event.extendedProps.routineId);
                    } else {
                        onTaskClick(Number(info.event.id));
                    }
                }}
                datesSet={(info) =>
                    onRangeChange(
                        format(info.start, "yyyy-MM-dd"),
                        // FullCalendar's end is exclusive.
                        format(subDays(info.end, 1), "yyyy-MM-dd"),
                    )
                }
                dateClick={(info) => onDateClick(info.dateStr)}
                eventDrop={async (info) => {
                    const ok = await onTaskDrop(
                        Number(info.event.id),
                        info.event.startStr,
                    );
                    if (!ok) info.revert();
                }}
            />
        </CalendarWrapper>
    );
}

const CalendarWrapper = styled.div`
    .task-done {
        opacity: 0.5;
        text-decoration: line-through;
    }

    .routine-missed {
        opacity: 0.5;
    }

    @media screen and (max-width: 600px) {
        .task-calendar-toolbar {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
        }

        .task-calendar-toolbar > * {
            display: flex;
            flex-wrap: wrap;
            gap: 0.25rem;
        }

        .task-calendar-toolbar > * > * {
            display: flex;
            flex-wrap: wrap;
            max-width: 100%;
        }

        .task-calendar-toolbar > *:last-child {
            justify-content: flex-start;
        }
    }
`;
