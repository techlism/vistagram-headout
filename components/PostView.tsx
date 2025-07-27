"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { PostCard } from "@/components/PostCard";
import type { Post } from "@/lib/types";
import { Button } from "./ui/button";

interface PostViewProps {
    post: Post;
    currentUserId: string;
}

export function PostView({ post, currentUserId }: PostViewProps) {
    const router = useRouter();

    return (
        <>
            <div className="sticky top-0 bg-white border-b p-4 z-10">
                <div className="flex items-center space-x-3">
                    <Button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="text-lg font-semibold">Post</h1>
                </div>
            </div>

            <PostCard post={post} currentUserId={currentUserId} />
        </>
    );
}
