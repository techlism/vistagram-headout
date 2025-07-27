"use client";

import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreatePost } from "@/components/CreatePost";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Post } from "@/lib/types";

interface TopBarProps {
    username?: string;
    onPostCreated?: (newPost: Post) => void;
}

export function TopBar({ username, onPostCreated }: TopBarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const toggleNavbar = () => setIsOpen(!isOpen);

    const handleSignOut = async () => {
        try {
            const response = await fetch("/api/sign-out");
            if (response.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error("Sign out failed:", error);
        }
    };

    return (
        <nav className="sticky top-2 backdrop-blur-md bg-white/80 border-gray-200 border z-10 rounded-lg mb-4">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between p-4">
                    <Link href='/' className="text-xl font-bold">Vistagram</Link>

                    <div className="hidden md:flex items-center space-x-4">
                        <div className="text-base text-gray-600">
                            {username ? (
                                <span className="font-medium">Hello, {username}</span>
                            ) : (
                                <Link href="/" className="hover:underline underline-offset-1">Please sign in to Like/Comment</Link>
                            )}
                        </div>

                        {onPostCreated && (
                            <CreatePost onPostCreated={onPostCreated} />
                        )}
                        {username && (
                            <Button
                                onClick={handleSignOut}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <LogOut size={16} className="mr-1" />
                                Sign Out
                            </Button>
                        )}
                    </div>

                    <div className="md:hidden">
                        <Button
                            onClick={toggleNavbar}
                            variant="ghost"
                            size="sm"
                            className="p-2"
                        >
                            {!isOpen ? <Menu size={20} /> : <X size={20} />}
                        </Button>
                    </div>
                </div>

                {isOpen && (
                    <div className="md:hidden">
                        <Separator />
                        <div className="px-4 py-3 space-y-2">
                            <div className="text-gray-600 mb-2">
                                {username ? (
                                    <span className="font-medium">Hello, {username}</span>
                                ) : (
                                    <Link href="/" className="hover:underline underline-offset-1">Please sign in to Like/Comment</Link>
                                )}
                            </div>
                            {onPostCreated && (
                                <CreatePost onPostCreated={onPostCreated} />
                            )}
                            {username && (
                                <Button
                                    onClick={handleSignOut}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full justify-start"
                                >
                                    <LogOut size={16} className="mr-2" />
                                    Sign Out
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>


        </nav>
    );
}
