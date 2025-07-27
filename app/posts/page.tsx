import { eq } from "drizzle-orm";
import { TopBar } from "@/components/TopBar";
import { PostsFeed } from "@/components/PostsFeed";
import { validateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

async function getInitialPosts() {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/posts?limit=10`,
        {
            cache: "no-store",
        },
    );

    if (!response.ok) {
        throw new Error("Failed to fetch posts");
    }

    return response.json();
}

export default async function Posts() {
    const { session, user } = await validateRequest();
    const initialData = await getInitialPosts();

    let username = "";
    if (session) {
        const usernames = await db
            .select({
                username: users.username,
            })
            .from(users)
            .where(eq(users.id, session.userId))
            .limit(1);

        username = usernames.length > 0 ? usernames[0].username : "";
    }

    return (
        <div className="max-w-5xl mx-auto min-h-screen">
            <PostsFeed
                initialPosts={initialData.posts}
                initialNextCursor={initialData.nextCursor}
                initialHasNextPage={initialData.hasNextPage}
                currentUserId={user?.id}
                username={username}
            />
        </div>
    );
}