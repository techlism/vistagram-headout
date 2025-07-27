import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { comments, users } from "@/lib/db/schema";

interface RouteParams {
    params: Promise<{ postId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const { postId } = await params;

    try {
        const postComments = await db
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
            .orderBy(desc(comments.createdAt));

        return NextResponse.json({ comments: postComments });
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Failed to fetch comments" },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    const { user } = await validateRequest();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;
    const { content } = await request.json();

    if (!content?.trim()) {
        return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    try {
        const commentId = nanoid();
        await db.insert(comments).values({
            id: commentId,
            postId,
            userId: user.id,
            content: content.trim(),
        });

        return NextResponse.json({ success: true, commentId });
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Failed to create comment" },
            { status: 500 },
        );
    }
}