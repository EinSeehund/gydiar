import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/hooks/useCategories", () => ({
    useCategories: () => ({
        data: { categories: [] },
        error: undefined,
        isLoading: false,
    }),
}));

import RoutineForm from "./RoutineForm";

async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText("Title"), "Water plants");
    await user.click(screen.getByLabelText("Dismiss it automatically"));
}

describe("RoutineForm", () => {
    it("keeps the form open and shows the error when saving fails", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue("Invalid reference");
        const onCancel = vi.fn();

        render(
            <RoutineForm
                routine={null}
                onSubmit={onSubmit}
                onCancel={onCancel}
                onDelete={vi.fn()}
            />,
        );
        await fillRequired(user);
        await user.click(screen.getByRole("button", { name: "Create" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Invalid reference",
        );
        expect(onCancel).not.toHaveBeenCalled();
    });

    it("submits the payload and closes on success", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(null);
        const onCancel = vi.fn();

        render(
            <RoutineForm
                routine={null}
                onSubmit={onSubmit}
                onCancel={onCancel}
                onDelete={vi.fn()}
            />,
        );
        await fillRequired(user);
        await user.click(screen.getByRole("button", { name: "Create" }));

        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Water plants",
                freq: "day",
                interval: 1,
                keep_open: false,
            }),
        );
        expect(onCancel).toHaveBeenCalled();
    });

    it("shows the clamp note for a monthly custom day after the 28th", async () => {
        const user = userEvent.setup();
        render(
            <RoutineForm
                routine={null}
                onSubmit={vi.fn()}
                onCancel={vi.fn()}
                onDelete={vi.fn()}
            />,
        );

        await user.selectOptions(screen.getByLabelText("Unit"), "month");
        await user.click(screen.getByLabelText(/Custom day/));
        const day = screen.getByRole("spinbutton", { name: "Day of month" });
        await user.clear(day);
        await user.type(day, "30");

        expect(
            screen.getByText(/In months with fewer than 30 days/),
        ).toBeInTheDocument();
        expect(screen.getByText("Every month on the 30th")).toBeInTheDocument();
    });
});
