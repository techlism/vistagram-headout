import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle/";
import { db } from "../db";
import { sessions, users } from "../db/schema";

const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

export default adapter;