import { desc, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { validateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { posts, users } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 20);

    try {
        const query = db
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
            .orderBy(desc(posts.createdAt))
            .limit(limit + 1);

        if (cursor) {
            query.where(sql`${posts.createdAt} < ${new Date(cursor)}`);
        }

        const results = await query;
        const hasNextPage = results.length > limit;
        const postsData = hasNextPage ? results.slice(0, -1) : results;

        const nextCursor = hasNextPage
            ? postsData[postsData.length - 1].createdAt.toISOString()
            : null;

        return NextResponse.json({
            posts: postsData,
            nextCursor,
            hasNextPage,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to fetch posts" },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    const { user } = await validateRequest();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("image") as File;
        const caption = formData.get("caption") as string;
        const location = formData.get("location") as string;

        if (!file) {
            return NextResponse.json({ error: "Image is required" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const compressedBuffer = await sharp(buffer)
            .resize(1080, 1080, { fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer();

        const compressedFile = new File(
            [new Uint8Array(compressedBuffer)],
            file.name,
            { type: "image/jpeg" },
        );

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`,
            {
                method: "POST",
                body: (() => {
                    const formData = new FormData();
                    formData.append("file", compressedFile);
                    return formData;
                })(),
            },
        );

        if (!response.ok) {
            throw new Error("Upload failed");
        }

        const { imageUrl } = await response.json();

        const postId = nanoid();
        await db.insert(posts).values({
            id: postId,
            userId: user.id,
            imageUrl,
            caption,
            location,
        });

        return NextResponse.json({ success: true, postId });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to create post" },
            { status: 500 },
        );
    }
}