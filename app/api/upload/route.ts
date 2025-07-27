import { type NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { generatePresignedUrl } from "@/lib/storage";

export async function POST(request: NextRequest) {
    const { user, session } = await validateRequest();
    if (!user) {
        console.log('user not found \n', session);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "File is required" }, { status: 400 });
        }

        const { uploadUrl, publicUrl } = await generatePresignedUrl(
            file.name,
            file.type,
            file.size,
        );

        const uploadResponse = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
                "Content-Type": file.type,
            },
        });

        if (!uploadResponse.ok) {
            throw new Error("Upload failed");
        }

        return NextResponse.json({ imageUrl: publicUrl });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 },
        );
    }
}
