# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm dev          # Start dev server on port 3434
pnpm build        # Production build (runs prisma generate + next build + postbuild)
pnpm start        # Start production server
pnpm analyze      # Build with bundle analysis
pnpm lint         # ESLint with auto-fix
```

## Architecture Overview

This is a Next.js 14 personal blog (App Router) using:

- **Content**: Contentlayer2 for MDX processing (blog posts, snippets, authors)
- **Styling**: Tailwind CSS with custom theme
- **Database**: PostgreSQL via Prisma (post view counts only)
- **Package Manager**: pnpm

### Content Pipeline

MDX files in `/data` → Contentlayer2 → Typed objects at build time

- `/data/blog/*.mdx` - Blog posts
- `/data/snippets/*.mdx` - Code snippets
- `/data/authors/*.mdx` - Author profiles

Each MDX file requires frontmatter (title, date, tags, etc.). Contentlayer auto-generates reading time, slug, and TOC.

### Key Directories

- `/app` - Next.js App Router (pages and API routes)
- `/components` - React components (Server Components by default, use `'use client'` for client)
- `/layouts` - Content layout templates (post-layout, list-layout)
- `/server` - Server-side utilities (GitHub API, Prisma, TOC generation)
- `/data/site-metadata.ts` - Site configuration

### API Routes

- `/api/spotify` - Now playing integration
- `/api/github` - Repository data for projects page
- `/api/memos` - External memos integration
- `/api/newsletter` - Buttondown subscription

### Build-time Generation

- `/json/tag-data.json` - Tag statistics
- `/public/search.json` - Search index for kbar

## Environment Variables

Required for full functionality (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection
- `GITHUB_API_TOKEN` - GitHub API
- `SPOTIFY_*` - Spotify credentials
- `MEMOS_*` - Memos API
- `NEXT_PUBLIC_GISCUS_*` - Comments system

## Conventions

- Conventional commits enforced via commitlint
- Path aliases: `@/` and `~/` map to project root
- MDX components registered in `/components/mdx/index.tsx`
- Avoid creating page files that only import and render a single component with no other content - write the content directly in the page file instead. Extracting components is fine when the page structure is complex or when components are reused
