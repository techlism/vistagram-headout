"use client";

import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Heart, Share } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Comment, Post } from "@/lib/types";

interface IndividualPostViewProps {
    post: Post;
    currentUserId: string | null;
    initialComments: Comment[];
    initialIsLiked: boolean;
}

function PostHeader() {
    const router = useRouter();

    return (
        <div className="border-b px-4 py-2.5">
            <div className="flex items-center space-x-3">
                <Button
                    onClick={() => router.back()}
                    variant="ghost"
                    size="sm"
                    className="p-0 rounded-lg"
                >
                    <ArrowLeft size={20} />
                </Button>
                <h2 className="text-lg font-semibold">Post</h2>
            </div>
        </div>
    );
}

function CommentsHeader() {
    return (
        <div className="border-b px-4 py-3">
            <h2 className="text-lg font-semibold">Comments</h2>
        </div>
    );
}

export function IndividualPostView({
    post,
    currentUserId,
    initialComments,
    initialIsLiked
}: IndividualPostViewProps) {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likesCount, setLikesCount] = useState(post.likesCount);
    const [sharesCount, setSharesCount] = useState(post.sharesCount || 0);
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLike = async () => {
        if (!currentUserId) return;

        try {
            const method = isLiked ? "DELETE" : "POST";
            const response = await fetch(`/api/posts/${post.id}/like`, { method });

            if (response.ok) {
                setIsLiked(!isLiked);
                setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
            }
        } catch (error) {
            console.error("Failed to toggle like:", error);
        }
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/posts/${post.id}`;
        if (navigator.share) {
            await navigator.share({
                title: "Vistagram Post",
                text: post.caption || "Check out this post!",
                url: shareUrl,
            }).then(async () => {
                const response = await fetch(`/api/posts/${post.id}/share`, {
                    method: "POST",
                })
                if (response.ok) {
                    setSharesCount((prev) => prev + 1);
                }
            })
        }
        else {
            await navigator.clipboard.writeText(shareUrl);
            alert("Link copied to clipboard!");
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUserId || !newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/posts/${post.id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newComment.trim() }),
            });

            if (response.ok) {
                const responseData = await response.json();
                const commentData = responseData.comment || responseData;

                if (commentData) {
                    setComments(prev => [commentData, ...prev]);
                    setNewComment("");
                }
            }
        } catch (error) {
            console.error("Failed to add comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!currentUserId) return;

        try {
            const response = await fetch(
                `/api/posts/${post.id}/comments/${commentId}`,
                { method: "DELETE" }
            );

            if (response.ok) {
                setComments((prev) => prev.filter((c) => c.id !== commentId));
            }
        } catch (error) {
            console.error("Failed to delete comment:", error);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row border rounded-lg">
            <div className="flex-1 lg:max-w-md lg:border-r">
                <PostHeader />

                <div className="p-4 space-y-4">
                    <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                            <AvatarImage
                                src={post.avatar === null ? undefined : post.avatar}
                                alt={post.username}
                            />
                            <AvatarFallback>{post.username[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">@{post.username}</p>
                            {post.location && (
                                <p className="text-sm text-gray-500">{post.location}</p>
                            )}
                        </div>
                    </div>

                    <div className="relative aspect-square">
                        {/** biome-ignore lint/performance/noImgElement: It's fine */}
                        <img
                            src={post.imageUrl}
                            alt={post.caption || "Post image"}
                            className="object-cover w-full h-full rounded-lg"
                            loading="lazy"
                        />
                    </div>

                    {post.caption && (
                        <div>
                            <span className="font-semibold">@{post.username}</span>{" "}
                            <span>{post.caption}</span>
                        </div>
                    )}

                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLike}
                            disabled={!currentUserId}
                            className={`p-1 flex border flex-row items-center ${isLiked ? "text-red-500" : "text-gray-700"} ${!currentUserId ? "cursor-not-allowed opacity-50" : ""}`}
                        >
                            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                            {likesCount > 0 && (
                                <p className="font-semibold text-sm">
                                    {likesCount} {likesCount === 1 ? "like" : "likes"}
                                </p>
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleShare}
                            className="p-1 border text-gray-700"
                        >
                            <Share size={20} />
                            {sharesCount > 0 && (
                                <p className="font-semibold text-sm">
                                    {sharesCount} {sharesCount === 1 ? "share" : "shares"}
                                </p>
                            )}
                        </Button>
                    </div>

                    <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                </div>
            </div>

            <div className="flex-1 lg:min-w-0 flex flex-col">
                <CommentsHeader />

                <div className="flex-1 flex flex-col p-4">
                    <div className="flex-1 mb-4 overflow-hidden">
                        {comments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>No comments yet</p>
                                <p className="text-sm">Be the first to comment!</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[calc(100vh-320px)] lg:max-h-[calc(100vh-280px)] overflow-y-auto">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex items-start justify-between space-x-3">
                                        <div className="flex items-start space-x-2 flex-1 min-w-0">
                                            <Avatar className="w-8 h-8 flex-shrink-0">
                                                <AvatarImage
                                                    src={comment.avatar === null ? undefined : comment.avatar}
                                                    alt={comment.username}
                                                />
                                                <AvatarFallback>
                                                    {comment.username?.[0]?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm break-words">
                                                    <span className="font-semibold">@{comment.username}</span>{" "}
                                                    <span>{comment.content}</span>
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatDistanceToNow(new Date(comment.createdAt), {
                                                        addSuffix: true,
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        {comment.userId === currentUserId && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="text-red-500 text-xs px-2 py-1 h-auto flex-shrink-0"
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {currentUserId ? (
                        <form onSubmit={handleCommentSubmit} className="space-y-3 border-t pt-4">
                            <Input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                disabled={isSubmitting}
                                className="rounded-lg border-gray-300 focus:border-blue-500"
                            />
                            <Button
                                type="submit"
                                disabled={!newComment.trim() || isSubmitting}
                                className="w-full rounded-lg"
                            >
                                {isSubmitting ? "Posting..." : "Post Comment"}
                            </Button>
                        </form>
                    ) : (
                        <div className="border-t pt-4 text-center text-gray-500">
                            <p>Sign in to comment</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}