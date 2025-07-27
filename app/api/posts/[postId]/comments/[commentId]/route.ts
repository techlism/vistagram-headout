import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { comments } from "@/lib/db/schema";

interface RouteParams {
    params: Promise<{ commentId: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const { user } = await validateRequest();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId } = await params;

    try {
        const result = await db
            .delete(comments)
            .where(and(eq(comments.id, commentId), eq(comments.userId, user.id)));
        if (result.rowsAffected > 0) return NextResponse.json({ success: true });
        throw new Error("Unable to delete comment");
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to delete comment" },
            { status: 500 },
        );
    }
}
