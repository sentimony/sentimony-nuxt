# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sentimony Records — JAMstack portfolio website for a psychedelic music label. Built with Nuxt 4 (SSR via Netlify serverless), Supabase (auth + likes), Firebase Realtime Database (content source), and Tailwind CSS.

Live: [sentimony.com](https://sentimony.com) · Staging: `stage--sentimony-nuxt.netlify.app`

## Commands

```bash
# Development (requires .env/.env)
npm run dev -- --host

# Build & deploy
npm run build
npm run deploy:stage
npm run deploy:prod

# Sync data sources
npm run sync:firebase   # exports Firebase DB → public/data/sentimony-db-export.json
npm run sync:supabase   # syncs data to Supabase

# PWA
npm run verify:pwa      # validate manifest + custom service worker
```

Local env lives in `.env/.env` (team defaults, gitignored); `.env/.env.local` holds personal overrides. The npm scripts load `.env/.env` then `.env/.env.local`. Define: `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SECRET_KEY` (canonical Nuxt names `NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_KEY`, `NUXT_SUPABASE_SECRET_KEY` also work). Optional: `RELEASES_SOURCE=supabase` to switch a data source from Firebase to Supabase.

## Architecture

### Data sources (dual-backend)

Server API handlers (`server/api/`) use `defineCachedEventHandler` with a 1-hour cache. Each handler checks `process.env.RELEASES_SOURCE` to decide whether to fetch from Supabase or Firebase. Firebase is the legacy/default source; Supabase is the new path being migrated to.

- **Firebase Realtime DB** — content (releases, artists, videos, events, playlists, friends)
- **Supabase** — Postgres for content (migration target) + auth + likes/favourites system

### Server utilities

- `server/utils/supabase.ts` — anonymous Supabase client + field mappers (snake_case → camelCase)
- `server/utils/supabaseAdmin.ts` — service-role client (used for privileged writes)

### Composables pattern

Each entity has two composables:
- `useXxx()` — wraps `useAsyncData` + `$fetch('/api/xxx')` for collection
- `useXxxLikes()` — manages optimistic like/unlike with Supabase auth guard

Likes redirect unauthenticated users to `/signin`. The `useLikes()` composable at `app/composables/useLikes.ts` is the release-likes implementation; entity-specific variants (artists, videos, tracks, events, playlists) follow the same pattern.

Auth pages (`app/pages/`): `signin`, `signup`, `forgot-password`, `reset-password`, `confirm`. Routing is wired via `@nuxtjs/supabase` `redirectOptions` in `nuxt.config.ts`.

The `toArray()` helper (`app/composables/toArray.ts`) normalises Firebase object-keyed responses and Supabase array responses into a uniform array.

### Pages & routing

All pages are in `app/pages/`. Pattern: list page (`releases.vue`) + detail page (`release/[id].vue`). The `Item` component is the universal card used across all list pages.

### Rendering strategy (ISR)

In production, most routes use ISR with `maxAge: 86400` (configured in `nuxt.config.ts` `routeRules`). ISR is intentionally disabled in dev to avoid a known `unstorage` ENOTDIR bug. API routes are CDN-cached for 1 hour with 24-hour SWR.

### PWA

Manual SW setup (no module): `public/custom-sw.js` (precache + offline fallback), registered by `app/plugins/pwa.client.ts`. The SW registers **in production only** (`import.meta.dev` guard) to avoid stale caches persisting on `localhost:3000` across projects. Assets: `public/site.webmanifest`, `public/offline.html`. Run `npm run verify:pwa` after changing any of these.

### UI components (shadcn-vue)

`components.json` (new-york style, lucide icons) drives generation. Primitives live in `app/components/ui/*` and are auto-imported via `~/components/ui` with `pathPrefix: false` (configured in `nuxt.config.ts`). The `cn()` class-merge helper is in `app/lib/utils.ts`. Built on reka-ui.

### Netlify Edge Functions (`netlify/edge-functions/`)

- `blocking.ts` — returns 403 for PHP/WordPress/admin scanner probes
- `redirects.ts` — handles legacy `.htm`/`.html` URL redirects and dead platform links (Google Play)

### Constants

- `app/constants/nav.ts` — navigation items with `inHeader` flag; `isNavActive()` handles section-level active state
- `app/constants/icons.ts` — centralised icon registry; supports Iconify names and custom SVG URLs
- `app/constants/soclinks.ts` — social link definitions

### Types

All shared TypeScript types live in `app/types/index.ts`. Entities extend `BaseEntity` (`slug`, `title`, `visible`, `date`). API responses are typed as `XxxResponse` with union `Record<string, Xxx> | Xxx[]` to handle both Firebase and Supabase shapes.

### SEO

Each page calls `useSeoMeta()` with full OG + Twitter card tags. Brand defaults (defaultOgImage, site URL) come from `app/app.config.ts`. The sitemap is suppressed on staging (`stage--`) deployments.

## Code style

Коментарі в коді не використовуємо. Код має бути самодокументованим через назви змінних і функцій.
