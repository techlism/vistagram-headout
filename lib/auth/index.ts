import type { Session, User } from "lucia";
import { Lucia, TimeSpan } from "lucia";
import { cookies } from "next/headers";
import adapter from "./adapter";

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        },
    },
    sessionExpiresIn: new TimeSpan(3, "w"),
});

export const validateRequest = async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
> => {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
        return {
            user: null,
            session: null,
        };
    }

    const result = await lucia.validateSession(sessionId);

    try {
        if (result.session?.fresh) {
            const sessionCookie = lucia.createSessionCookie(result.session.id);
            cookieStore.set(
                sessionCookie.name,
                sessionCookie.value,
                sessionCookie.attributes,
            );
        }
        if (!result.session) {
            const sessionCookie = lucia.createBlankSessionCookie();
            cookieStore.set(
                sessionCookie.name,
                sessionCookie.value,
                sessionCookie.attributes,
            );
        }
    } catch { }
    return result;
};

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia
    }
}
