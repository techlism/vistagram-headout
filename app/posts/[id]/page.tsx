import { and, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { IndividualPostView } from "@/components/IndividualPostView";
import { validateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { comments, likes, posts, users } from "@/lib/db/schema";

async function getPostData(postId: string, userId?: string) {
    const [post, postComments, likeStatus] = await Promise.all([
        db
            .select({
                id: posts.id,
                userId: posts.userId,
                username: users.username,
                avatar: users.avatar,
                imageUrl: posts.imageUrl,
                caption: posts.caption,
                location: posts.location,
                likesCount: posts.likesCount,
                sharesCount: posts.sharesCount,
                createdAt: posts.createdAt,
            })
            .from(posts)
            .innerJoin(users, eq(posts.userId, users.id))
            .where(eq(posts.id, postId))
            .limit(1),

        db
            .select({
                id: comments.id,
                content: comments.content,
                createdAt: comments.createdAt,
                userId: comments.userId,
                username: users.username,
                avatar: users.avatar,
            })
            .from(comments)
            .innerJoin(users, eq(comments.userId, users.id))
            .where(eq(comments.postId, postId))
            .orderBy(desc(comments.createdAt)),

        userId ? db
            .select()
            .from(likes)
            .where(and(eq(likes.postId, postId), eq(likes.userId, userId)))
            .limit(1) : [],
    ]);

    return {
        post: post[0] || null,
        comments: postComments,
        isLiked: likeStatus.length > 0,
    };
}

export default async function PostPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { user } = await validateRequest();
    const postId = (await params).id;
    const { post, comments, isLiked } = await getPostData(postId, user?.id);

    if (!post) {
        notFound();
    }

    return (
        <main className="min-h-screen w-full grid grid-cols-1 items-center">
            <div className="max-w-5xl mx-auto rounded-lg">
                <IndividualPostView
                    post={post}
                    currentUserId={user?.id || null}
                    initialComments={comments}
                    initialIsLiked={isLiked}
                />
            </div>
        </main>
    );
}