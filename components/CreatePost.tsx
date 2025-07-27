"use client";

import { Image as ImageIcon, Plus, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Post } from "@/lib/types";

interface CreatePostProps {
    onPostCreated: (post: Post) => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [caption, setCaption] = useState("");
    const [location, setLocation] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!image || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("image", image);
            formData.append("caption", caption);
            formData.append("location", location);

            const response = await fetch("/api/posts", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                onPostCreated(result);
                resetForm();
                setIsOpen(false);
            }
        } catch (error) {
            console.error("Failed to create post:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setImage(null);
        setImagePreview(null);
        setCaption("");
        setLocation("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="p-4 border-b bg-gray-50">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full">
                        <Plus size={20} className="mr-2" />
                        Create Post
                    </Button>
                </DialogTrigger>
                <DialogContent className="w-full max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Post</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                            {imagePreview ? (
                                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                            setImage(null);
                                            setImagePreview(null);
                                        }}
                                        className="absolute top-2 right-2"
                                    >
                                        <X size={16} />
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full aspect-square border-dashed flex flex-col"
                                >
                                    <ImageIcon size={32} />
                                    <p className="mt-2 text-sm">Click to select image</p>
                                </Button>
                            )}
                        </div>

                        <Textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Write a caption..."
                            rows={3}
                        />

                        <Input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Add location (optional)"
                        />

                        <Button
                            type="submit"
                            disabled={!image || isSubmitting}
                            className="w-full"
                        >
                            {isSubmitting ? "Posting..." : "Share Post"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
