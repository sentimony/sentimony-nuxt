# CLAUDE.md

Guidance for Claude Code working in this repository.

## Project Overview

Sentimony Records - JAMstack portfolio for a psychedelic music label. Nuxt 4 (SSR via Netlify serverless), Firebase Realtime DB or Supabase (switchable catalog content), Supabase (auth + likes/profile), Tailwind v4.

Live: [sentimony.com](https://sentimony.com) · Staging: `stage--sentimony-nuxt.netlify.app`

## Commands

```bash
npm run dev   # dev (requires .env/.env)
npm run build
npm run sync:firebase   # sync data/sentimony-db-export.json → Firebase DB
npm run sync:supabase   # sync data/sentimony-db-export.json → Supabase content tables
npm run deploy:stage    # Netlify stage
npm run deploy:prod     # Netlify prod
CATALOG_SOURCE=firebase npm run dev
CATALOG_SOURCE=supabase npm run dev
npm run verify:pwa      # validate manifest + custom service worker
npx nuxi typecheck      # vue-tsc type check
npx supabase db push    # apply migrations to remote (needs SUPABASE_ACCESS_TOKEN in .env/.env.local)
npx supabase link --project-ref dugbgewuzowoogglccue --yes   # link project before first push
```

Supabase CLI: використовувати через `npx supabase` (не глобальний). `SUPABASE_ACCESS_TOKEN` (формат `sbp_...`) — Personal Access Token з [Supabase Dashboard → Account → Access Tokens](https://supabase.com/dashboard/account/tokens), зберігати в `.env/.env.local`.

**Supabase CLI + `.env`-директорія:** `npx supabase db push` падає з `read .env: is a directory` бо `.env` — директорія, не файл. Workaround — `db query --linked --file`:
```bash
# Instead of db push, run SQL directly from a tmp directory with an empty .env file.
TOKEN=$(grep SUPABASE_ACCESS_TOKEN .env/.env.local | cut -d= -f2)
mkdir -p /tmp/sb && cp supabase/config.toml /tmp/sb/ && cp -r supabase/.temp /tmp/sb/ && touch /tmp/sb/.env
cd /tmp/sb && SUPABASE_ACCESS_TOKEN="$TOKEN" npx supabase db query --linked --file /path/to/migration.sql
```

Env: `.env/.env` (team defaults, gitignored) then `.env/.env.local` (personal) - both auto-loaded by the npm scripts. Define `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SECRET_KEY` (canonical `NUXT_PUBLIC_SUPABASE_URL` / `NUXT_PUBLIC_SUPABASE_KEY` / `NUXT_SUPABASE_SECRET_KEY` also work). `CATALOG_SOURCE=firebase|supabase` chooses the content source at process start; `NUXT_CATALOG_SOURCE` can override it in deployed Nuxt/Nitro runtime. `RELEASES_SOURCE` still works as a legacy fallback. `NETLIFY_AUTH_TOKEN` in `.env/.env.local` (personal access token of the site-owning Netlify account) makes `deploy:stage`/`deploy:prod` independent of the active `netlify switch` account.

The nuxt scripts (`dev`/`build`/`generate`/`preview`/`postinstall`) are prefixed `TMPDIR=/tmp` - don't remove it. Nuxt 4.4.7's vite-node IPC uses a Unix socket under `os.tmpdir()`; on macOS the default `$TMPDIR` (`/var/folders/…/T/`) pushes the socket path past the 104-char `sun_path` limit → `connect EINVAL …sock` on the first request. `/tmp` keeps it short. Harmless on Linux/Netlify (already short) and Windows (named pipes, not affected).

## Architecture

**Data sources.** Server catalog handlers (`server/api/`) use `defineCachedEventHandler` and read public content from the active `catalogSource`: Firebase Realtime DB or Supabase content tables (`releases`, `artists`, `videos`, `events`, `playlists`, `friends`, `tracks`). In Firebase mode, track API responses are derived from each release's `tracklistCompact` via `server/utils/firebaseCatalog.ts`. Supabase is always used for auth, profile/avatar storage, and likes/favourites.

**Server utils.** `server/utils/catalogSource.ts` - normalized catalog source switch. `server/utils/firebaseCatalog.ts` - Firebase fetch helpers + track parsing. `server/utils/supabase.ts` - anon client + Supabase row mappers. `server/utils/likeCounts.ts` - non-blocking like counters for catalog responses. `server/utils/supabaseAdmin.ts` - service-role client for privileged auth/likes/profile writes.

**Composables.** Each entity has `useXxx()` (wraps `useAsyncData` + `$fetch('/api/xxx')`) and `useXxxLikes()` (optimistic like/unlike with Supabase auth guard; unauth → `/signin`). `useLikes()` (`app/composables/useLikes.ts`) is the release reference; artist/video/track/event/playlist variants follow it. A failed like reverts the optimistic update and fires `toast.error` (vue-sonner); `<Toaster>` is mounted once in `app/app.vue`. `toArray()` (`app/composables/toArray.ts`) normalises Firebase object-keyed and Supabase array responses into one array.

**Profile.** `app/pages/profile.vue` — layout з навігацією по підсторінках (`/profile`, `/profile/releases`, `/profile/tracks`, `/profile/artists`, `/profile/videos`, `/profile/playlists`, `/profile/events`). `app/pages/profile/index.vue` — картки Name/Email/Avatar/Account + колекція. Аватар зберігається в Supabase Storage bucket `avatars` (публічний, RLS: читає всі, пише тільки власник за шляхом `{uid}/avatar.*`); міграція: `supabase/migrations/20260626_storage_avatars.sql`. `useProfileSummary()` — підрахунок лайків по всіх секціях.

**User ID у `@nuxtjs/supabase`:** `useSupabaseUser()` повертає JWT-об'єкт де ID знаходиться в `user?.sub`, а не `user?.id` (як у стандартному Supabase JS SDK). Завжди використовуй `user?.sub ?? user?.id` — див. `server/utils/likes.ts`.

**Auth.** Pages `signin`, `signup`, `forgot-password`, `reset-password`, `confirm` (routing via `@nuxtjs/supabase` `redirectOptions` in `nuxt.config.ts`). `signin`/`signup`/`forgot` share `app/components/AuthForm.vue` - validated by `vee-validate` with a function-based per-mode schema (`forgot` omits password, `signin` requires it, `signup` `min(6)`), **not** zod (`@vee-validate/zod` needs zod 3 but the project has zod 4 via nuxtseo - they conflict). `PasswordInput.vue` is the shared password field with show/hide toggle; server errors show in an inline `Alert`.

**Pages.** All in `app/pages/`; list page (`releases.vue`) + detail (`release/[id].vue`). `Item` is the universal card across list pages.

**Rendering (ISR).** Production routes use ISR `maxAge: 86400` (`nuxt.config.ts` `routeRules`); disabled in dev to dodge an `unstorage` ENOTDIR bug. API routes are CDN-cached 1h + 24h SWR.

**Styling (Tailwind v4).** Via the `@tailwindcss/vite` plugin - **no** `tailwind.config`/`postcss.config`. Theme tokens (light in `:root`, dark in `.dark` - source order matters since both are specificity-equal), the `dark` variant, and a global `input:-webkit-autofill` override (tied to `var(--foreground)`) live in `app/assets/css/tailwind.css` (`@theme` / `@theme inline`). `body` still provides the legacy dark forest background for non-home routes. The homepage mounts `HomepageAtmosphere.vue` only on `/`; light theme shows the purpose-made `trees-light_v1.jpg` plain, dark theme shows the legacy `trees-dark_v1.jpg` plain (same URL as the non-home `body` background, so the browser cache is shared) behind the existing fractal/content layers. Default is dark (set pre-paint by an inline script in `app.head`, persisted in `localStorage['theme']`); `useTheme()` + `<ThemeToggle>` switch with a View Transitions circular reveal. Many components still hardcode `text-white/X` etc. (baked in for dark) - light theme is token-level only, not yet polished per-component.

**PWA.** Manual SW (no module): `public/custom-sw.js` (precache + offline fallback), registered by `app/plugins/pwa.client.ts` **in production only** (`import.meta.dev` guard) to avoid stale `localhost:3000` caches. Assets: `public/site.webmanifest`, `public/offline.html`. Run `npm run verify:pwa` after touching these.

**UI (shadcn-vue).** `components.json` (new-york). Primitives in `app/components/ui/*`, auto-imported via `~/components/ui` with `pathPrefix: false` + `extensions: ['vue']`; `cn()` in `app/lib/utils.ts`; built on reka-ui. Gotchas:
- Auto-import keys off the `.vue` **filename**, not the `index.ts` barrel - `Sonner.vue` → `<Sonner>`, not `Toaster`. Import explicitly when export name ≠ filename (`<Toaster>` in `app/app.vue`).
- **No** `@lucide/vue` despite `components.json` saying `lucide` - icons use `@nuxt/icon` with **lucide** as the UI set (`<Icon name="lucide:…" />`, native 24px/stroke-2) and **Simple Icons** for brands. Swap lucide imports after `shadcn-vue add`. Lucide has no solid variants - fill an outline icon by forcing SVG render mode and overriding the path's `fill="none"`: `<Icon name="lucide:heart" mode="svg" :class="liked && '[&_path]:fill-current'" />` (plain `fill-current` on the `<svg>` is beaten by the path's own `fill="none"`; mask/css mode has no path to target).
- **Brand icons → Simple Icons** (`<Icon name="simple-icons:…" />`); registry in `app/constants/icons.ts` maps each `IconKey` to a `simple-icons:*` name. A few marks Simple Icons lacks stay as custom SVG (`kind: 'svg'` / `img=`/`@nuxt/image`): JunoDownload, Amazon Music, Qobuz.
- No global `border-border` base layer (many bare `border` utilities rely on `currentColor`) - set borders per instance (auth Cards use `border-white/20`).
- **`font-mono` = Azeret Mono** for technical data: BPM, catalog numbers (`SR-042`), track duration (`4:32`), total release duration. Apply `font-mono` to any element rendering these values.
- **No `@apply` in `<style scoped>`** - Tailwind v4 treats scoped blocks as isolated CSS contexts; `@apply` throws `Cannot apply unknown utility class`. Move styles to `class=""` in the template, or add `@reference "tailwindcss"` as the first line of the scoped block. Pure CSS (transitions, animations) without `@apply` is fine.

**Netlify Edge Functions** (`netlify/edge-functions/`): `blocking.ts` (403 for PHP/WP/admin scanner probes), `redirects.ts` (legacy `.htm`/`.html` + dead platform links).

**Constants.** `app/constants/nav.ts` (nav items + `inHeader`; `isNavActive()` for section-level active), `icons.ts` (icon registry - Iconify names + custom SVG URLs), `soclinks.ts` (social links).

**Types.** Shared types in `app/types/index.ts`. Entities extend `BaseEntity` (`slug`, `title`, `visible`, `date`); API responses typed `XxxResponse` as `Record<string, Xxx> | Xxx[]` for both backends.

**SEO.** Every page calls `useSeoMeta()` (full OG + Twitter tags); brand defaults in `app/app.config.ts`; sitemap suppressed on `stage--` deploys.

## Code style

Коментарі в коді не використовуємо. Код має бути самодокументованим через назви змінних і функцій.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
