import { NextResponse } from "next/server";
import { seedPosts } from "@/lib/scripts/seed";

export async function GET() {
    seedPosts();
    return NextResponse.json({ msg: "Seed Route" });
}
