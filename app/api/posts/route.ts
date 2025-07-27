import { desc, eq, lt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { validateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { posts, users } from "@/lib/db/schema";
import { generatePresignedUrl } from "@/lib/storage";

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
            query.where(lt(posts.createdAt, new Date(cursor)));
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

        // Process the image with Sharp
        const buffer = Buffer.from(await file.arrayBuffer());
        const compressedBuffer = await sharp(buffer)
            .resize(1080, 1080, { fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer();

        // Generate a unique filename
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const uniqueFileName = `${nanoid()}.${fileExtension}`;

        // Generate presigned URL for upload
        const { uploadUrl, publicUrl } = await generatePresignedUrl(
            uniqueFileName,
            "image/jpeg", // We're converting to JPEG
            compressedBuffer.length,
        );

        // Upload directly to storage
        const uploadResponse = await fetch(uploadUrl, {
            method: "PUT",
            body: new Uint8Array(compressedBuffer),
            headers: {
                "Content-Type": "image/jpeg",
            },
        });

        if (!uploadResponse.ok) {
            throw new Error("Upload failed");
        }

        // Create post in database
        const postId = nanoid();
        await db.insert(posts).values({
            id: postId,
            userId: user.id,
            imageUrl: publicUrl,
            caption,
            location,
        });

        // Fetch the complete post data with user info to return
        const newPost = await db
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

        if (newPost.length === 0) {
            throw new Error("Failed to retrieve created post");
        }

        return NextResponse.json({
            success: true,
            postId,
            post: newPost[0]
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to create post" },
            { status: 500 },
        );
    }
}