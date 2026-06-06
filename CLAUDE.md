# CLAUDE.md

Guidance for Claude Code working in this repository.

## Project Overview

Sentimony Records - JAMstack portfolio for a psychedelic music label. Nuxt 4 (SSR via Netlify serverless), Supabase (auth + likes), Firebase Realtime DB (legacy content source), Tailwind v4.

Live: [sentimony.com](https://sentimony.com) · Staging: `stage--sentimony-nuxt.netlify.app`

## Commands

```bash
npm run dev -- --host   # dev (requires .env/.env)
npm run build
npm run deploy:stage
npm run deploy:prod
npm run sync:firebase   # export Firebase DB → public/data/sentimony-db-export.json
npm run sync:supabase   # sync data to Supabase
npm run verify:pwa      # validate manifest + custom service worker
npx nuxi typecheck      # vue-tsc type check
```

Env: `.env/.env` (team defaults, gitignored) then `.env/.env.local` (personal) - both auto-loaded by the npm scripts. Define `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SECRET_KEY` (canonical `NUXT_PUBLIC_SUPABASE_URL` / `NUXT_PUBLIC_SUPABASE_KEY` / `NUXT_SUPABASE_SECRET_KEY` also work). Optional `RELEASES_SOURCE=supabase` switches a data source from Firebase to Supabase - **baked at build time** into `runtimeConfig.releasesSource` (Netlify UI env vars never reach function runtime on CLI deploys); runtime override via `NUXT_RELEASES_SOURCE` still works where env injection exists. `NETLIFY_AUTH_TOKEN` in `.env/.env.local` (personal access token of the site-owning Netlify account) makes `deploy:stage`/`deploy:prod` independent of the active `netlify switch` account.

The nuxt scripts (`dev`/`build`/`generate`/`preview`/`postinstall`) are prefixed `TMPDIR=/tmp` - don't remove it. Nuxt 4.4.7's vite-node IPC uses a Unix socket under `os.tmpdir()`; on macOS the default `$TMPDIR` (`/var/folders/…/T/`) pushes the socket path past the 104-char `sun_path` limit → `connect EINVAL …sock` on the first request. `/tmp` keeps it short. Harmless on Linux/Netlify (already short) and Windows (named pipes, not affected).

## Architecture

**Data sources (dual-backend).** Server handlers (`server/api/`) use `defineCachedEventHandler` (1h cache) and check `useRuntimeConfig().releasesSource` to fetch from Supabase or Firebase - Firebase is legacy/default, Supabase the migration target. Firebase Realtime DB holds content (releases, artists, videos, events, playlists, friends); Supabase holds Postgres content (migration target) + auth + likes/favourites.

**Server utils.** `server/utils/supabase.ts` - anon client + snake_case→camelCase mappers. `server/utils/supabaseAdmin.ts` - service-role client for privileged writes.

**Composables.** Each entity has `useXxx()` (wraps `useAsyncData` + `$fetch('/api/xxx')`) and `useXxxLikes()` (optimistic like/unlike with Supabase auth guard; unauth → `/signin`). `useLikes()` (`app/composables/useLikes.ts`) is the release reference; artist/video/track/event/playlist variants follow it. A failed like reverts the optimistic update and fires `toast.error` (vue-sonner); `<Toaster>` is mounted once in `app/app.vue`. `toArray()` (`app/composables/toArray.ts`) normalises Firebase object-keyed and Supabase array responses into one array.

**Auth.** Pages `signin`, `signup`, `forgot-password`, `reset-password`, `confirm` (routing via `@nuxtjs/supabase` `redirectOptions` in `nuxt.config.ts`). `signin`/`signup`/`forgot` share `app/components/AuthForm.vue` - validated by `vee-validate` with a function-based per-mode schema (`forgot` omits password, `signin` requires it, `signup` `min(6)`), **not** zod (`@vee-validate/zod` needs zod 3 but the project has zod 4 via nuxtseo - they conflict). `PasswordInput.vue` is the shared password field with show/hide toggle; server errors show in an inline `Alert`.

**Pages.** All in `app/pages/`; list page (`releases.vue`) + detail (`release/[id].vue`). `Item` is the universal card across list pages.

**Rendering (ISR).** Production routes use ISR `maxAge: 86400` (`nuxt.config.ts` `routeRules`); disabled in dev to dodge an `unstorage` ENOTDIR bug. API routes are CDN-cached 1h + 24h SWR.

**Styling (Tailwind v4).** Via the `@tailwindcss/vite` plugin - **no** `tailwind.config`/`postcss.config`. Theme tokens (light in `:root`, dark in `.dark` - source order matters since both are specificity-equal), the `dark` variant, and a global `input:-webkit-autofill` override (tied to `var(--foreground)`) live in `app/assets/css/tailwind.css` (`@theme` / `@theme inline`). `body` still provides the legacy dark forest background for non-home routes. The homepage mounts `HomepageAtmosphere.vue` only on `/`; it reuses `trees-origin_v1.jpg` for both themes with Morning Veil light filters and nocturnal dark filters behind the existing fractal/content layers. Default is dark (set pre-paint by an inline script in `app.head`, persisted in `localStorage['theme']`); `useTheme()` + `<ThemeToggle>` switch with a View Transitions circular reveal. Many components still hardcode `text-white/X` etc. (baked in for dark) - light theme is token-level only, not yet polished per-component.

**PWA.** Manual SW (no module): `public/custom-sw.js` (precache + offline fallback), registered by `app/plugins/pwa.client.ts` **in production only** (`import.meta.dev` guard) to avoid stale `localhost:3000` caches. Assets: `public/site.webmanifest`, `public/offline.html`. Run `npm run verify:pwa` after touching these.

**UI (shadcn-vue).** `components.json` (new-york). Primitives in `app/components/ui/*`, auto-imported via `~/components/ui` with `pathPrefix: false` + `extensions: ['vue']`; `cn()` in `app/lib/utils.ts`; built on reka-ui. Gotchas:
- Auto-import keys off the `.vue` **filename**, not the `index.ts` barrel - `Sonner.vue` → `<Sonner>`, not `Toaster`. Import explicitly when export name ≠ filename (`<Toaster>` in `app/app.vue`).
- **No** `@lucide/vue` despite `components.json` saying `lucide` - icons use `@nuxt/icon` with **lucide** as primary (`<Icon name="lucide:…" />`, native 24px/stroke-2); **tabler** is the auxiliary set for glyphs lucide lacks. Swap lucide imports after `shadcn-vue add`. Lucide has no solid variants - fill an outline icon by forcing SVG render mode and overriding the path's `fill="none"`: `<Icon name="lucide:heart" mode="svg" :class="liked && '[&_path]:fill-current'" />` (plain `fill-current` on the `<svg>` is beaten by the path's own `fill="none"`; mask/css mode has no path to target).
- **Brand icons → Simple Icons** (`<Icon name="simple-icons:…" />`); registry in `app/constants/icons.ts` maps each `IconKey` to a `simple-icons:*` name. A few marks Simple Icons lacks stay as custom SVG (`kind: 'svg'` / `img=`/`@nuxt/image`): JunoDownload, Amazon Music, Qobuz.
- No global `border-border` base layer (many bare `border` utilities rely on `currentColor`) - set borders per instance (auth Cards use `border-white/20`).

**Netlify Edge Functions** (`netlify/edge-functions/`): `blocking.ts` (403 for PHP/WP/admin scanner probes), `redirects.ts` (legacy `.htm`/`.html` + dead platform links).

**Constants.** `app/constants/nav.ts` (nav items + `inHeader`; `isNavActive()` for section-level active), `icons.ts` (icon registry - Iconify names + custom SVG URLs), `soclinks.ts` (social links).

**Types.** Shared types in `app/types/index.ts`. Entities extend `BaseEntity` (`slug`, `title`, `visible`, `date`); API responses typed `XxxResponse` as `Record<string, Xxx> | Xxx[]` for both backends.

**SEO.** Every page calls `useSeoMeta()` (full OG + Twitter tags); brand defaults in `app/app.config.ts`; sitemap suppressed on `stage--` deploys.

## Code style

Коментарі в коді не використовуємо. Код має бути самодокументованим через назви змінних і функцій.
