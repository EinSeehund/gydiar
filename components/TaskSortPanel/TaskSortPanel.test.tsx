import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TaskSortPanel from "./TaskSortPanel";

describe("TaskSortPanel", () => {
    it("calls onChange with the new sort key", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(
            <TaskSortPanel
                sort={{ key: "date", direction: "asc" }}
                onChange={onChange}
                availableKeys={["date", "category", "project", "title"]}
            />,
        );

        await user.selectOptions(screen.getByLabelText("Sort by"), "title");

        expect(onChange).toHaveBeenCalledWith({ key: "title", direction: "asc" });
    });

    it("calls onChange with the flipped direction when the direction button is clicked", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(
            <TaskSortPanel
                sort={{ key: "date", direction: "asc" }}
                onChange={onChange}
                availableKeys={["date"]}
            />,
        );

        await user.click(screen.getByRole("button", { name: "Ascending" }));

        expect(onChange).toHaveBeenCalledWith({ key: "date", direction: "desc" });
    });

    it("shows the hidden-overdue-count label and toggles hideOverdue", async () => {
        const user = userEvent.setup();
        const onHideOverdueChange = vi.fn();

        render(
            <TaskSortPanel
                sort={{ key: "date", direction: "asc" }}
                onChange={vi.fn()}
                availableKeys={["date"]}
                hideOverdue={false}
                onHideOverdueChange={onHideOverdueChange}
                overdueCount={3}
            />,
        );

        const toggle = screen.getByRole("button", { name: "Hide overdue tasks" });
        await user.click(toggle);

        expect(onHideOverdueChange).toHaveBeenCalledWith(true);
    });

    it("shows the show-overdue label with count when hideOverdue is true", () => {
        render(
            <TaskSortPanel
                sort={{ key: "date", direction: "asc" }}
                onChange={vi.fn()}
                availableKeys={["date"]}
                hideOverdue
                onHideOverdueChange={vi.fn()}
                overdueCount={3}
            />,
        );

        expect(
            screen.getByRole("button", { name: "Show overdue tasks (3 hidden)" }),
        ).toBeInTheDocument();
    });
});
