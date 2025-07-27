"use client";

import { ArrowLeft, Camera, FileImage, Plus, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Post } from "@/lib/types";
import { Label } from "./ui/label";

interface CreatePostProps {
    onPostCreated: (post: Post) => void;
}

type Step = "select" | "details";

export function CreatePost({ onPostCreated }: CreatePostProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<Step>("select");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [caption, setCaption] = useState("");
    const [location, setLocation] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Detect if device is desktop (no touch support or large screen)
        const checkDevice = () => {
            const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
            const isLargeScreen = window.innerWidth >= 1024;
            setIsDesktop(!hasTouch || isLargeScreen);
        };

        checkDevice();
        window.addEventListener("resize", checkDevice);
        return () => window.removeEventListener("resize", checkDevice);
    }, []);

    const handleImageSelect = (file: File) => {
        setImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
            setStep("details");
        };
        reader.readAsDataURL(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageSelect(file);
        }
    };

    const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageSelect(file);
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
                // Use the complete post object returned from the API
                if (result.post) {
                    onPostCreated(result.post);
                    resetForm();
                    setIsOpen(false);
                }
            }
        } catch (error) {
            console.error("Failed to create post:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setStep("select");
        setImage(null);
        setImagePreview(null);
        setCaption("");
        setLocation("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        if (cameraInputRef.current) {
            cameraInputRef.current.value = "";
        }
    };

    const goBack = () => {
        if (step === "details") {
            setStep("select");
            setImage(null);
            setImagePreview(null);
        }
    };

    return (
        <Drawer
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) {
                    // Reset form when drawer closes
                    setTimeout(() => {
                        if (!open) {
                            resetForm();
                        }
                    }, 150); // Small delay to ensure smooth closing animation
                }
            }}
        >
            <DrawerTrigger asChild>
                <Button className="rounded-lg" variant={'outline'}>
                    <Plus size={20} className="mr-0.5" />
                    Create Post
                </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[85vh]">
                <DrawerHeader className="border-b px-4 py-3">
                    <div className="flex items-center justify-between">
                        {step === "details" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={goBack}
                                className="p-2"
                            >
                                <ArrowLeft size={20} />
                            </Button>
                        )}
                        <DrawerTitle className="flex-1 text-center">
                            {step === "select" ? "Create New Post" : "Post Details"}
                        </DrawerTitle>
                        {step === "details" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                                className="p-2"
                            >
                                <X size={20} />
                            </Button>
                        )}
                    </div>
                </DrawerHeader>

                <div className="px-4 py-6 overflow-y-auto">
                    {/* Hidden file inputs */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleCameraCapture}
                        className="hidden"
                    />

                    {step === "select" ? (
                        <div className="space-y-4">
                            {isDesktop ? (
                                // Desktop: Single option
                                <div className="flex justify-center">
                                    <Button
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="h-20 w-full max-w-sm flex flex-col space-y-2 border-2 border-dashed hover:border-solid transition-all"
                                    >
                                        <FileImage size={32} />
                                        <span className="text-sm font-medium">Choose Photo</span>
                                    </Button>
                                </div>
                            ) : (
                                // Mobile: Both options
                                <div className="grid grid-cols-1 gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => cameraInputRef.current?.click()}
                                        className="h-20 flex flex-col space-y-2 border-2 border-dashed hover:border-solid transition-all"
                                    >
                                        <Camera size={24} />
                                        <span className="text-sm font-medium">Take Photo</span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="h-20 flex flex-col space-y-2 border-2 border-dashed hover:border-solid transition-all"
                                    >
                                        <FileImage size={24} />
                                        <span className="text-sm font-medium">
                                            Choose from Gallery
                                        </span>
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Image Preview */}
                            <div className="relative max-w-sm mx-auto">
                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                                    {imagePreview && (
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={goBack}
                                    className="absolute top-2 right-2 rounded-full h-8 w-8 p-0 shadow-md bg-white/90 hover:bg-white"
                                >
                                    <X size={16} />
                                </Button>
                            </div>

                            {/* Caption */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                    Caption
                                </Label>
                                <Textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="Write a caption..."
                                    rows={3}
                                    className="resize-none rounded-lg border-2 focus:border-blue-500 transition-colors"
                                />
                            </div>

                            {/* Location */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                    Location <span className="text-gray-400">(optional)</span>
                                </Label>
                                <Input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Add location"
                                    className="rounded-lg border-2 focus:border-blue-500 transition-colors"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4 pb-2">
                                <Button
                                    type="submit"
                                    disabled={!image || isSubmitting}
                                    className="w-full h-12 rounded-lg font-semibold text-base"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Posting...</span>
                                        </div>
                                    ) : (
                                        "Share Post"
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
}
