// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL || !process.env.DATABASE_AUTH_TOKEN) {
    throw new Error('DATABASE_URL and DATABASE_AUTH_TOKEN environment variable is required');
}

export default defineConfig({
    schema: './lib/db/schema.ts',
    out: './drizzle',
    dialect: 'sqlite',
    dbCredentials: {
        url: process.env.DATABASE_URL,
        authToken: process.env.DATABASE_AUTH_TOKEN,
    },
});