import { eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";

interface RouteParams {
    params: Promise<{ postId: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
    const { postId } = await params;

    try {
        await db
            .update(posts)
            .set({
                sharesCount: sql`shares_count + 1`,
            })
            .where(eq(posts.id, postId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to share post" },
            { status: 500 }
        );
    }
}