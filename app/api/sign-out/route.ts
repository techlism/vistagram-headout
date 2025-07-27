import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { lucia, validateRequest } from "@/lib/auth";

export const GET = async () => {
    try {
        const { session } = await validateRequest();

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await lucia.invalidateSession(session.id);

        const sessionCookie = lucia.createBlankSessionCookie();

        (await cookies()).set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes,
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred while signing out" },
            { status: 500 },
        );
    }
};
