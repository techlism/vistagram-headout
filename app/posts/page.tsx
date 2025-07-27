import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
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

    if (!session) {
        redirect("/");
    }

    const initialData = await getInitialPosts();
    console.log(initialData);

    // Fix: Access the username property correctly
    const usernames = await db
        .select({
            username: users.username,
        })
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

    const username: string = usernames.length > 0 ? usernames[0].username : "";

    return (
        <div className="max-w-md mx-auto min-h-screen ">
            <div className="sticky top-0  border-b p-4 z-10">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Vistagram</h1>
                    <span className="text-sm text-gray-600">Hello, @{username}</span>
                </div>
            </div>

            <PostsFeed
                initialPosts={initialData.posts}
                initialNextCursor={initialData.nextCursor}
                initialHasNextPage={initialData.hasNextPage}
                currentUserId={user.id} // Now user is available
            />
        </div>
    );
}
