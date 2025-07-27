"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createGoogleAuthorizationURL } from "@/actions/oauth.google";
import { Button } from "@/components/ui/button";

export default function SignInWithGoogle() {
    const router = useRouter();
    const [message, setMessage] = useState<string>("");
    async function handleGoogleSignUp() {
        const res = await createGoogleAuthorizationURL();
        if (!res.success || !res.data) {
            setMessage(res.error || "An error occurred");
            setTimeout(() => setMessage(""), 5000);
            return;
        }
        return router.push(res.data);
    }
    return (
        <div>
            {message && <p>{message}</p>}
            <Button
                onClick={handleGoogleSignUp}
                className="w-full text-base"
            >
                Sign up with Google
            </Button>
        </div>
    );
}
