"use client";

import { useCallback, useState } from "react";
import { CreatePost } from "@/components/CreatePost";
import { PostCard } from "@/components/PostCard";
import { PostSkeleton } from "@/components/PostSkeleton";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { Post, PostsResponse } from "@/lib/types";

interface PostsFeedProps {
    initialPosts: Post[];
    initialNextCursor: string | null;
    initialHasNextPage: boolean;
    currentUserId: string;
}

export function PostsFeed({
    initialPosts,
    initialNextCursor,
    initialHasNextPage,
    currentUserId,
}: PostsFeedProps) {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [nextCursor, setNextCursor] = useState<string | null>(
        initialNextCursor,
    );
    const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
    const [isFetching, setIsFetching] = useState(false);

    const fetchNextPage = useCallback(async () => {
        if (!nextCursor || !hasNextPage || isFetching) return;

        setIsFetching(true);
        try {
            const params = new URLSearchParams();
            params.set("limit", "10");
            params.set("cursor", nextCursor);

            const response = await fetch(`/api/posts?${params}`);
            const data: PostsResponse = await response.json();

            setPosts((prev) => [...prev, ...data.posts]);
            setNextCursor(data.nextCursor);
            setHasNextPage(data.hasNextPage);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            setIsFetching(false);
        }
    }, [nextCursor, hasNextPage, isFetching]);

    const loadMoreRef = useInfiniteScroll({
        hasNextPage,
        isFetching,
        fetchNextPage,
    });

    const handleNewPost = (newPost: Post) => {
        setPosts((prev) => [newPost, ...prev]);
    };

    return (
        <>
            <CreatePost onPostCreated={handleNewPost} />

            <div className="divide-y divide-gray-100">
                {posts.map((post) => (
                    <PostCard key={post.id} post={post} currentUserId={currentUserId} />
                ))}
            </div>

            {hasNextPage && (
                <div ref={loadMoreRef} className="p-4">
                    {isFetching && <PostSkeleton />}
                </div>
            )}

            {!hasNextPage && posts.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                    You've reached the end
                </div>
            )}
        </>
    );
}
