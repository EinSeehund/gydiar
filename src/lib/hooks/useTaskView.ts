import { useRouter } from "next/router";
import { useState } from "react";
import {
    DEFAULT_HIDE_OVERDUE,
    DEFAULT_HIDE_ROUTINES,
    DEFAULT_SORT,
    isSortDirection,
    isSortKey,
    type TaskSort,
    type TaskView,
} from "@/lib/taskView";

const HIDE_OVERDUE_STORAGE_KEY = "hideOverdueTasks";
const HIDE_ROUTINES_STORAGE_KEY = "hideRoutines";

function readStoredHideOverdue(): boolean {
    if (typeof window === "undefined") return DEFAULT_HIDE_OVERDUE;
    return window.localStorage.getItem(HIDE_OVERDUE_STORAGE_KEY) === "1";
}

function readStoredHideRoutines(): boolean {
    if (typeof window === "undefined") return DEFAULT_HIDE_ROUTINES;
    return window.localStorage.getItem(HIDE_ROUTINES_STORAGE_KEY) === "1";
}

type UseTaskViewOptions = {
    allowHideOverdueFilter?: boolean;
};

export function useTaskView({
    allowHideOverdueFilter = false,
}: UseTaskViewOptions = {}) {
    const router = useRouter();
    const { sort: sortParam, dir: dirParam } = router.query;

    const sort: TaskSort = {
        key: isSortKey(sortParam) ? sortParam : DEFAULT_SORT.key,
        direction: isSortDirection(dirParam)
            ? dirParam
            : DEFAULT_SORT.direction,
    };

    const [hideOverdueState, setHideOverdueState] = useState(() =>
        allowHideOverdueFilter ? readStoredHideOverdue() : DEFAULT_HIDE_OVERDUE,
    );
    const hideOverdue = allowHideOverdueFilter && hideOverdueState;
    const [hideRoutines, setHideRoutinesState] = useState(
        readStoredHideRoutines,
    );

    const view: TaskView = { sort, hideOverdue, hideRoutines };

    function setSort(newSort: TaskSort): void {
        // Keep other params (e.g. [slug]) so dynamic routes still resolve.
        const rest = { ...router.query };
        delete rest.sort;
        delete rest.dir;
        const isDefault =
            newSort.key === DEFAULT_SORT.key &&
            newSort.direction === DEFAULT_SORT.direction;

        router.replace(
            {
                pathname: router.pathname,
                query: isDefault
                    ? rest
                    : { ...rest, sort: newSort.key, dir: newSort.direction },
            },
            undefined,
            { shallow: true, scroll: false },
        );
    }

    function setHideOverdue(newValue: boolean): void {
        if (!allowHideOverdueFilter) return;

        window.localStorage.setItem(
            HIDE_OVERDUE_STORAGE_KEY,
            newValue ? "1" : "0",
        );
        setHideOverdueState(newValue);
    }

    function setHideRoutines(newValue: boolean): void {
        window.localStorage.setItem(
            HIDE_ROUTINES_STORAGE_KEY,
            newValue ? "1" : "0",
        );
        setHideRoutinesState(newValue);
    }

    return { view, setSort, setHideOverdue, setHideRoutines };
}
