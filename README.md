# Vistagram

A modern Instagram-like social media application built for Headout assignment.

## Tech Stack

- **Framework**: Next.js 15.3.3 with TypeScript
- **Styling**: Tailwind CSS with shadcn UI components
- **Database**: Turso (libSQL) with Drizzle ORM
- **Authentication**: Lucia Auth with Arctic (For OAuth providers)
- **File Storage**: Cloudflare R2

## Features

- User authentication with OAuth providers
- Image upload and storage
- Social media feed
- User profiles and avatars
- Responsive design

## Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- AWS S3 / Cloudflare R2 bucket credentials
- Turso database Credentials
- OAuth provider credentials (Google etc.)

## Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL=libsql://********.turso.io
DATABASE_AUTH_TOKEN=ey******
NEXT_PUBLIC_BASE_URL=http://localhost:3000
GOOGLE_CLIENT_SECRET=GOCSPX-******************
GOOGLE_CLIENT_ID=************.apps.googleusercontent.com
# R2 (S3 Compatible)
R2_ACCESS_KEY_ID=5****
R2_SECRET_ACCESS_KEY=e8b6*****************
R2_ENDPOINT=https://****************.r2.cloudflarestorage.com
R2_BUCKET_NAME=bucketname
R2_PUBLIC_URL=https://pub******.r2.dev
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/techlism/vistagram-headout.git
cd vistagram-headout
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables (see above)

4. Run database migrations (according to the need):

```bash
node --env-file=.env.local ./node_modules/.bin/drizzle-kit push
```

```bash
node --env-file=.env.local ./node_modules/.bin/drizzle-kit generate
```

5. Start the development server:

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Database Setup

This project uses Turso (libSQL) with Drizzle ORM. To set up:

1. Create a Turso database at [turso.tech](https://turso.tech)
2. Get your database URL and auth token
3. Add them to your `.env.local` file
4. Run migrations with `node --env-file=.env.local ./node_modules/.bin/drizzle-kit push` (optionally just create tables in the turso directly)

## Deployment

The application can be deployed on Vercel, Netlify, or any platform supporting Next.js.

## Project Structure

```
vistagram-headout/
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                 # Utility functions and configurations
├── public/              # Static assets
```
