import { useMemo } from "react";
import styled from "styled-components";
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

type TaskCalendarProps = {
    tasks: Task[];
    categories: Category[];
    onTaskClick: (taskId: number) => void;
    onDateClick: (date: string) => void;
    onTaskDrop: (taskId: number, newDate: string) => Promise<boolean>;
};

export default function TaskCalendar({
    tasks,
    categories,
    onTaskClick,
    onDateClick,
    onTaskDrop,
}: TaskCalendarProps) {
    const events = useMemo(
        () =>
            tasks
                .filter((task) => task.due_date !== null)
                .map((task) => ({
                    id: String(task.id),
                    title: task.title,
                    start: task.due_date as string,
                    allDay: true,
                    color: categories.find(
                        (category) => category.id === task.category_id,
                    )?.color ?? "#232323",
                    className: task.status === "done" ? "task-done" : "",
                })),
        [tasks, categories],
    );
    
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
                eventClick={(info) => onTaskClick(Number(info.event.id))}
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
`;
