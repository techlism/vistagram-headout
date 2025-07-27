import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { PostView } from "@/components/PostView";
import { validateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { posts, users } from "@/lib/db/schema";

async function getPost(postId: string) {
    const post = await db
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
        .limit(1);

    return post[0] || null;
}

interface PostPageProps {
    params: { id: string };
}

export default async function PostPage({ params }: PostPageProps) {
    const { user } = await validateRequest();

    if (!user) {
        redirect("/");
    }

    const post = await getPost(params.id);

    if (!post) {
        notFound();
    }

    return (
        <div className="max-w-md mx-auto min-h-screen bg-white">
            <PostView post={post} currentUserId={user.id} />
        </div>
    );
}