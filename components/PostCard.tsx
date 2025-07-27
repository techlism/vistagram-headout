"use client";

import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, MoreHorizontal, Share2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Comment, Post } from "@/lib/types";

interface PostCardProps {
    post: Post;
    currentUserId: string;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likesCount);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const checkLikeStatus = async () => {
            try {
                const response = await fetch(`/api/posts/${post.id}/like`);
                if (response.ok) {
                    const data = await response.json();
                    setIsLiked(data.isLiked);
                }
            } catch (error) {
                console.error("Failed to check like status:", error);
            }
        };

        checkLikeStatus();
    }, [post.id]);

    const handleLike = async () => {
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
        try {
            const response = await fetch(`/api/posts/${post.id}/share`, {
                method: "POST",
            });

            if (response.ok) {
                if (navigator.share) {
                    await navigator.share({
                        title: "Vistagram Post",
                        text: post.caption || "Check out this post!",
                        url: `${window.location.origin}/post/${post.id}`,
                    });
                } else {
                    await navigator.clipboard.writeText(
                        `${window.location.origin}/post/${post.id}`,
                    );
                    alert("Link copied to clipboard!");
                }
            }
        } catch (error) {
            console.error("Failed to share:", error);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await fetch(`/api/posts/${post.id}/comments`);
            if (response.ok) {
                const data = await response.json();
                setComments(data.comments);
            }
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        }
    };

    const handleCommentToggle = () => {
        if (!showComments) {
            fetchComments();
        }
        setShowComments(!showComments);
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/posts/${post.id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newComment.trim() }),
            });

            if (response.ok) {
                setNewComment("");
                fetchComments();
            }
        } catch (error) {
            console.error("Failed to add comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            const response = await fetch(
                `/api/posts/${post.id}/comments/${commentId}`,
                {
                    method: "DELETE",
                },
            );

            if (response.ok) {
                setComments((prev) => prev.filter((c) => c.id !== commentId));
            }
        } catch (error) {
            console.error("Failed to delete comment:", error);
        }
    };

    return (
        <article className="">
            <header className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={post.avatar === null ? undefined : post.avatar} alt={post.username} />
                        <AvatarFallback>{post.username[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-sm">@{post.username}</p>
                        {post.location && (
                            <p className="text-xs text-gray-500">{post.location}</p>
                        )}
                    </div>
                </div>
                <Button variant="ghost" size="sm">
                    <MoreHorizontal size={16} />
                </Button>
            </header>

            <div className="relative aspect-square bg-gray-100">
                {/** biome-ignore lint/performance/noImgElement: What else to use */}
                <img
                    src={post.imageUrl}
                    alt={post.caption || "Post image"}
                    loading="lazy"
                    className="object-cover"
                    sizes="(max-width: 448px) 100vw, 448px"
                />
            </div>

            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLike}
                            className={`p-1 ${isLiked ? "text-red-500" : "text-gray-700"}`}
                        >
                            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCommentToggle}
                            className="p-1 text-gray-700"
                        >
                            <MessageCircle size={20} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleShare}
                            className="p-1 text-gray-700"
                        >
                            <Share2 size={20} />
                        </Button>
                    </div>
                </div>

                {likesCount > 0 && (
                    <p className="font-semibold text-sm mb-2">
                        {likesCount} {likesCount === 1 ? "like" : "likes"}
                    </p>
                )}

                {post.caption && (
                    <div className="mb-2">
                        <span className="font-semibold text-sm">@{post.username}</span>{" "}
                        <span className="text-sm">{post.caption}</span>
                    </div>
                )}

                <p className="text-xs text-gray-500 mb-3">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>

                {showComments && (
                    <div className="border-t pt-3 space-y-3">
                        {comments.map((comment) => (
                            <div
                                key={comment.id}
                                className="flex items-start justify-between"
                            >
                                <div className="flex items-start space-x-2 flex-1">
                                    <Avatar className="w-6 h-6">
                                        <AvatarImage src={comment.avatar} alt={comment.username} />
                                        <AvatarFallback>
                                            {comment.username[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="text-sm">
                                            <span className="font-semibold">@{comment.username}</span>{" "}
                                            {comment.content}
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
                                        className="text-red-500 text-xs"
                                    >
                                        Delete
                                    </Button>
                                )}
                            </div>
                        ))}

                        <form
                            onSubmit={handleCommentSubmit}
                            className="flex space-x-2 pt-2"
                        >
                            <Input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 text-sm rounded-full"
                                disabled={isSubmitting}
                            />
                            <Button
                                type="submit"
                                disabled={!newComment.trim() || isSubmitting}
                                size="sm"
                                className="rounded-full"
                            >
                                Post
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </article>
    );
}
