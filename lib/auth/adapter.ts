import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "@/lib/db";
import { sessions, users } from "@/lib/db/schema";

const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

export default adapter;
