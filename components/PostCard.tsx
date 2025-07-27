"use client";

import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Post } from "@/lib/types";

interface PostCardProps {
    post: Post;
    currentUserId?: string;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
    const router = useRouter();
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likesCount);
    const [sharesCount, setSharesCount] = useState(post.sharesCount || 0);
    const [likeStatusChecked, setLikeStatusChecked] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (isVisible && !likeStatusChecked) {
            const checkLikeStatus = async () => {
                try {
                    const response = await fetch(`/api/posts/${post.id}/like`);
                    if (response.ok) {
                        const data = await response.json();
                        setIsLiked(data.isLiked);
                        setLikeStatusChecked(true);
                    }
                } catch (error) {
                    console.error("Failed to check like status:", error);
                }
            };

            checkLikeStatus();
        }
    }, [isVisible, likeStatusChecked, post.id]);

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

    const handleCommentClick = () => {
        router.push(`/posts/${post.id}`);
    };

    return (
        <article ref={cardRef} className="">
            <header className="flex items-center justify-between py-4">
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
            </header>

            <div className="relative aspect-square">
                {/** biome-ignore lint/performance/noImgElement: Not sure what else to be used */}
                <img
                    src={post.imageUrl}
                    alt={post.caption || "Post image"}
                    loading="lazy"
                    className="object-cover w-full h-full rounded-lg"
                    sizes="(max-width: 448px) 100vw, 448px"
                />
            </div>

            <div className="pt-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                        <Button
                            disabled={!currentUserId}
                            variant="ghost"
                            size="sm"
                            onClick={handleLike}
                            className={`p-1 flex border flex-row items-center ${isLiked ? "text-red-500" : "text-gray-700"}`}
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
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCommentClick}
                            className="p-1 text-gray-700 border"
                        >
                            <MessageCircle size={20} />
                        </Button>
                    </div>
                </div>

                {post.caption && (
                    <div className="mb-2">
                        <span className="font-semibold text-sm">@{post.username}</span>{" "}
                        <span className="text-sm text-wrap truncate">{post.caption}</span>
                    </div>
                )}

                <p className="text-xs text-gray-500 mb-3">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
            </div>
        </article>
    );
}