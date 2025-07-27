"use server";
import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth";
import { google } from "@/lib/auth/oauth";

export const createGoogleAuthorizationURL = async () => {
    const { session } = await validateRequest();

    if (session) {
        redirect("/posts");
    }
    try {
        const codeVerifier = generateCodeVerifier();

        const state = generateState();

        (await cookies()).set("codeVerifier", codeVerifier, {
            httpOnly: true,
        });

        (await cookies()).set("state", state, {
            httpOnly: true,
        });


        const authorizationURL = await google.createAuthorizationURL(
            state,
            codeVerifier,
            {
                scopes: ["email"],
            },
        );

        return {
            success: true,
            data: authorizationURL.toString(),
        };
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Something went wrong. Please retry";
        return {
            success: false,
            error: errorMessage,
        };
    }
};
