import { and, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { likes, posts } from "@/lib/db/schema";

interface RouteParams {
    params: Promise<{ postId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
    const { user } = await validateRequest();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;

    try {
        const existingLike = await db
            .select()
            .from(likes)
            .where(and(eq(likes.postId, postId), eq(likes.userId, user.id)))
            .limit(1);

        return NextResponse.json({ isLiked: existingLike.length > 0 });
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Failed to check like status" },
            { status: 500 },
        );
    }
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
    const { user } = await validateRequest();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;

    try {
        const existingLike = await db
            .select()
            .from(likes)
            .where(and(eq(likes.postId, postId), eq(likes.userId, user.id)))
            .limit(1);

        if (existingLike.length > 0) {
            return NextResponse.json({ error: "Already liked" }, { status: 400 });
        }

        await db.transaction(async (tx) => {
            await tx.insert(likes).values({
                id: nanoid(),
                postId,
                userId: user.id,
            });

            await tx
                .update(posts)
                .set({ likesCount: sql`${posts.likesCount} + 1` })
                .where(eq(posts.id, postId));
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to like post" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const { user } = await validateRequest();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;

    try {
        const existingLike = await db
            .select()
            .from(likes)
            .where(and(eq(likes.postId, postId), eq(likes.userId, user.id)))
            .limit(1);

        if (existingLike.length === 0) {
            return NextResponse.json({ error: "Not liked" }, { status: 400 });
        }

        await db.transaction(async (tx) => {
            await tx
                .delete(likes)
                .where(and(eq(likes.postId, postId), eq(likes.userId, user.id)));

            await tx
                .update(posts)
                .set({ likesCount: sql`${posts.likesCount} - 1` })
                .where(eq(posts.id, postId));
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Failed to unlike post" },
            { status: 500 },
        );
    }
}