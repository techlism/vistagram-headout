import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";

const r2Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT || "",
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
});

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const generateImageKey = (originalName: string): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";
    const uniqueId = nanoid(12);

    return `posts/${year}/${month}/${day}/${uniqueId}.${extension}`;
};

export const generatePresignedUrl = async (
    filename: string,
    contentType: string,
    contentLength: number,
): Promise<{ uploadUrl: string; imageKey: string; publicUrl: string }> => {
    if (!ALLOWED_IMAGE_TYPES.includes(contentType as typeof ALLOWED_IMAGE_TYPES[number])) {
        throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
    }

    if (contentLength > MAX_FILE_SIZE) {
        throw new Error("File too large. Maximum size is 5MB.");
    }

    const imageKey = generateImageKey(filename);

    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || "",
        Key: imageKey,
        ContentType: contentType,
        ContentLength: contentLength,
        CacheControl: "public, max-age=31536000",
        Metadata: {
            "uploaded-by": "vistagram",
            "upload-timestamp": new Date().toISOString(),
        },
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${imageKey}`;

    return {
        uploadUrl,
        imageKey,
        publicUrl,
    };
};

export const generateDownloadUrl = async (
    imageKey: string,
): Promise<string> => {
    const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || "",
        Key: imageKey,
    });

    return await getSignedUrl(r2Client, command, { expiresIn: 3600 });
};

export const deleteImage = async (imageKey: string): Promise<void> => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME || "",
            Key: imageKey,
        });

        await r2Client.send(command);
    } catch (error) {
        console.error("Failed to delete image from R2:", error);
    }
};

export const validateImageFile = (
    file: File,
): { valid: boolean; error?: string } => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
        return {
            valid: false,
            error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
        };
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: "File too large. Maximum size is 5MB.",
        };
    }

    return { valid: true };
};

export const uploadImageToR2 = async (
    file: File,
    uploadUrl: string,
): Promise<void> => {
    const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
            "Content-Type": file.type,
        },
    });

    if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
    }
};