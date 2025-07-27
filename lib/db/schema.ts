import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { generate } from "random-words";

export const users = sqliteTable("users", {
    id: text("id").primaryKey(),
    username: text("username").notNull().unique().$defaultFn(() => generate({ exactly: 2, join: '-' })),
    email: text("email").unique(),
    avatar: text('avatar'),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const sessions = sqliteTable("sessions", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id),
    expiresAt: integer("expires_at").notNull()
});

export const posts = sqliteTable('posts', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    imageUrl: text('image_url').notNull(),
    caption: text('caption'),
    location: text('location'),
    likesCount: integer('likes_count').notNull().default(0),
    sharesCount: integer('shares_count').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const comments = sqliteTable("comments", {
    id: text("id").primaryKey(),
    postId: text("post_id")
        .notNull()
        .references(() => posts.id, { onDelete: 'cascade' }),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    content: text("content").notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const likes = sqliteTable("likes", {
    id: text("id").primaryKey(),
    postId: text("post_id")
        .notNull()
        .references(() => posts.id, { onDelete: 'cascade' }),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
    uniqueLike: unique().on(table.postId, table.userId),
}));