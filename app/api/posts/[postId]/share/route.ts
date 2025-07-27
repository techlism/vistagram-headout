import { eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";

interface RouteParams {
    params: Promise<{ postId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    const { user } = await validateRequest();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;

    try {
        await db
            .update(posts)
            .set({ sharesCount: sql`${posts.sharesCount} + 1` })
            .where(eq(posts.id, postId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Failed to share post" },
            { status: 500 },
        );
    }
}
