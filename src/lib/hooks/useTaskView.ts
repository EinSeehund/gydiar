import { useRouter } from "next/router";
import {
    DEFAULT_SORT,
    isSortDirection,
    isSortKey,
    type TaskSort,
    type TaskView,
} from "@/lib/taskView";

export function useTaskView() {
    const router = useRouter();
    const { sort: sortParam, dir: dirParam } = router.query;

    const sort: TaskSort = {
        key: isSortKey(sortParam) ? sortParam : DEFAULT_SORT.key,
        direction: isSortDirection(dirParam)
            ? dirParam
            : DEFAULT_SORT.direction,
    };

    const view: TaskView = { sort };

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

    return { view, setSort };
}
