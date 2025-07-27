import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { lucia } from "@/lib/auth";
import { google } from "@/lib/auth/oauth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");

        const cookieStore = await cookies();
        const storedState = cookieStore.get("state")?.value;
        const storedCodeVerifier = cookieStore.get("codeVerifier")?.value;

        if (
            !code ||
            !state ||
            !storedState ||
            !storedCodeVerifier ||
            state !== storedState
        ) {
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }

        const tokens = await google.validateAuthorizationCode(
            code,
            storedCodeVerifier,
        );
        const googleUserResponse = await fetch(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${tokens.accessToken}`,
                },
            },
        );

        const googleUser = await googleUserResponse.json();

        let existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, googleUser.email))
            .limit(1);

        if (existingUser.length === 0) {
            await db.insert(users).values({
                id: nanoid(),
                email: googleUser.email,
            });

            existingUser = await db
                .select()
                .from(users)
                .where(eq(users.email, googleUser.email))
                .limit(1);
        }

        const session = await lucia.createSession(existingUser[0].id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);

        cookieStore.set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes,
        );

        return NextResponse.redirect(new URL("/posts", request.url));
    } catch (error) {
        console.error(error);
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }
}
