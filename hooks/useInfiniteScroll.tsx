import { useCallback, useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
    hasNextPage: boolean;
    isFetching: boolean;
    fetchNextPage: () => void;
    rootMargin?: string;
}

export function useInfiniteScroll({
    hasNextPage,
    isFetching,
    fetchNextPage,
    rootMargin = "100px",
}: UseInfiniteScrollOptions) {
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [target] = entries;
            if (target.isIntersecting && hasNextPage && !isFetching) {
                fetchNextPage();
            }
        },
        [fetchNextPage, hasNextPage, isFetching],
    );

    useEffect(() => {
        const element = loadMoreRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(handleObserver, {
            rootMargin,
        });

        observer.observe(element);
        return () => observer.unobserve(element);
    }, [handleObserver, rootMargin]);

    return loadMoreRef;
}
