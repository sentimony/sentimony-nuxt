# AGENTS.md

Guidance for Claude Code working in this repository (imported by `CLAUDE.md` via `@AGENTS.md`).

## Project Overview

Sentimony Records - JAMstack portfolio for a psychedelic music label. Nuxt 4 (SSR via Netlify serverless), Firebase Realtime DB or Supabase (switchable catalog content), Supabase (auth + likes/profile), Tailwind v4.

Live: [sentimony.com](https://sentimony.com) · Staging: `stage--sentimony-nuxt.netlify.app`

## Commands

```bash
npm run dev   # dev (requires .env/.env)
npm run build
npm run test:unit       # Vitest unit tests
npm run test:e2e        # Playwright e2e tests
npm run sync:firebase   # sync server/data/sentimony-db-export.json → Firebase DB
npm run sync:supabase   # sync server/data/sentimony-db-export.json → Supabase content tables
npm run deploy:stage    # Netlify stage
npm run deploy:prod     # Netlify prod
CATALOG_SOURCE=firebase npm run dev
CATALOG_SOURCE=supabase npm run dev
npm run verify:pwa      # validate manifest + custom service worker
npx nuxi typecheck      # Nuxt/Nitro type check; warns if Supabase env vars are absent locally
npx supabase link --project-ref dugbgewuzowoogglccue --yes   # link project before first push
```

Do not run `sync:*` unless explicitly asked; these scripts write to remote Firebase/Supabase stores.
No `npm run typecheck` script exists yet; use `npx nuxi typecheck`.
Current focused verification baseline: `npm run test:unit` -> 27 files / 107 tests; `npx nuxi typecheck` passes with local Supabase env warnings.

Supabase CLI: використовувати через `npx supabase` (не глобальний). `SUPABASE_ACCESS_TOKEN` (формат `sbp_...`) — Personal Access Token з [Supabase Dashboard → Account → Access Tokens](https://supabase.com/dashboard/account/tokens), зберігати в `.env/.env.local`.

**Supabase CLI + `.env`-директорія:** `npx supabase db push` падає з `read .env: is a directory` бо `.env` — директорія, не файл. Workaround — `db query --linked --file`:
```bash
# Instead of db push, run SQL directly from a tmp directory with an empty .env file.
TOKEN=$(grep SUPABASE_ACCESS_TOKEN .env/.env.local | cut -d= -f2)
mkdir -p /tmp/sb/supabase && cp supabase/config.toml /tmp/sb/supabase/ && cp -r supabase/.temp /tmp/sb/supabase/ && touch /tmp/sb/.env
cd /tmp/sb && SUPABASE_ACCESS_TOKEN="$TOKEN" npx supabase db query --linked --file /path/to/migration.sql
```

Env: `.env/.env` (team defaults, gitignored) then `.env/.env.local` (personal) - both auto-loaded by the npm scripts. Define `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SECRET_KEY` (canonical `NUXT_PUBLIC_SUPABASE_URL` / `NUXT_PUBLIC_SUPABASE_KEY` / `NUXT_SUPABASE_SECRET_KEY` also work). `CATALOG_SOURCE=firebase|supabase` chooses the content source at process start; `NUXT_CATALOG_SOURCE` can override it in deployed Nuxt/Nitro runtime. `NETLIFY_AUTH_TOKEN` in `.env/.env.local` (personal access token of the site-owning Netlify account) makes `deploy:stage`/`deploy:prod` independent of the active `netlify switch` account. `FIREBASE_DB_SECRET` in `.env/.env.local` (Firebase Console → Project Settings → Service Accounts → Database secrets) is required by `sync:firebase`, which writes via a REST `PUT` (`scripts/sync-firebase.mjs`) instead of the `firebase-tools` CLI.

The nuxt scripts (`dev`/`build`/`generate`/`preview`/`postinstall`) are prefixed `TMPDIR=/tmp` - don't remove it. Nuxt 4.x's vite-node IPC uses a Unix socket under `os.tmpdir()`; on macOS the default `$TMPDIR` (`/var/folders/…/T/`) pushes the socket path past the 104-char `sun_path` limit → `connect EINVAL …sock` on the first request. `/tmp` keeps it short. Harmless on Linux/Netlify (already short) and Windows (named pipes, not affected).

## Architecture

**Data sources.** Server catalog handlers (`server/api/`) use `defineCachedEventHandler` and read public content from the active `catalogSource`: Firebase Realtime DB or Supabase content tables (`releases`, `artists`, `videos`, `events`, `playlists`, `friends`, `tracks`). In Firebase mode, track API responses are derived from each release's `tracklistCompact` via `server/utils/firebaseCatalog.ts`. Supabase is always used for auth, profile/avatar storage, and likes/favourites.

**Catalog export.** The canonical local export is `server/data/sentimony-db-export.json`. `artists` is an object keyed by slug (`artists.irukanji`, not a numeric array). `scripts/sync-firebase.mjs` writes that shape to Firebase; `fetchFirebaseEntity()` still falls back to scanning numeric-key collections so older remote Firebase data does not 404 before sync.

**Tracks (first-class).** `tracks` in the export is an object keyed by canonical slug `slugify(artist_name + title)` (e.g. `boggy-elf-dream-of-ashvattha-in`) with `title`, `artist_name`, `artist_slug`, `bpm`, `audio_url` (R2 link, nullable) - no `release_slug`/`track_number`. Each release stores `tracklist: string[]` (ordered track slugs); `track_number` is derived from array position, so one track can live on several releases. Sync scripts mirror this section as-is (Firebase gets catalog fields only - likes/plays stay Supabase-only in `track_likes`/`track_plays`). Server-side hydration lives in `server/utils/releaseTracklist.ts` (`hydrateReleaseTracklist`, `expandReleaseTracks`) + `server/utils/catalogTracks.ts` (`fetchAllCatalogTrackRows` for both backends). Legacy slugs `<release>-<n>` are 301-redirected by `/track/[id]` (API returns `{ redirect }`); adding a track = add it to `tracks` + insert its slug into the release's `tracklist`, then run the sync scripts.

**Server utils.** `server/utils/catalogSource.ts` - normalized catalog source switch. `server/utils/firebaseCatalog.ts` - Firebase fetch helpers + track parsing. `server/utils/supabase.ts` - anon client + Supabase row mappers. `server/utils/likeCounts.ts` - non-blocking like counters for catalog responses. `server/utils/supabaseAdmin.ts` - service-role client for privileged auth/likes/profile writes.

**Composables.** Each entity has `useXxx()` (wraps `useAsyncData` + `$fetch('/api/xxx')`) and `useXxxLikes()` (optimistic like/unlike with Supabase auth guard; unauth → `/signin`). `useLikes()` (`app/composables/useLikes.ts`) is the release reference; artist/video/track/event/playlist variants follow it. A failed like reverts the optimistic update and fires `toast.error` (vue-sonner); `<Toaster>` is mounted once in `app/app.vue`. `toArray()` (`app/composables/toArray.ts`) normalises Firebase object-keyed and Supabase array responses into one array.

**Profile.** `app/pages/profile.vue` — layout з навігацією по підсторінках (`/profile`, `/profile/releases`, `/profile/tracks`, `/profile/artists`, `/profile/videos`, `/profile/playlists`, `/profile/events`). `app/pages/profile/index.vue` — картки Name/Email/Avatar/Account + колекція. Аватар зберігається в Supabase Storage bucket `avatars` (публічний, RLS: читає всі, пише тільки власник за шляхом `{uid}/avatar.*`); міграція: `supabase/migrations/20260626_storage_avatars.sql`. `useProfileSummary()` — підрахунок лайків по всіх секціях.

**User ID у `@nuxtjs/supabase`:** `useSupabaseUser()` повертає JWT-об'єкт де ID знаходиться в `user?.sub`, а не `user?.id` (як у стандартному Supabase JS SDK). Завжди використовуй `user?.sub ?? user?.id` — див. `server/utils/likes.ts`.

**Auth.** Pages `signin`, `signup`, `forgot-password`, `reset-password`, `confirm` (routing via `@nuxtjs/supabase` `redirectOptions` in `nuxt.config.ts`). `signin`/`signup`/`forgot` share `app/components/AuthForm.vue` - validated by `vee-validate` with a function-based per-mode schema (`forgot` omits password, `signin` requires it, `signup` `min(6)`), **not** zod (`@vee-validate/zod` needs zod 3 but the project has zod 4 via nuxtseo - they conflict). `PasswordInput.vue` is the shared password field with show/hide toggle; server errors show in an inline `Alert`.

**Pages.** All in `app/pages/`; list page (`releases.vue`) + detail (`release/[id].vue`). `Item` is the universal card across list pages.

**Rendering & caching.** No page-level ISR (removed from `routeRules` during the cache hot-fix). `routeRules` (`nuxt.config.ts`) sets `server/api/**` cache headers via `buildApiRouteRules()` (`server/utils/cachePolicy.ts`) and `robots: false` on auth/profile routes via `buildNoindexRouteRules()` (`server/utils/robotsPolicy.ts`, see SEO/Sitemap below): catalog routes (`/api/releases`, `/api/release/**`, etc.) get `Netlify-CDN-Cache-Control: public, max-age=3600, stale-while-revalidate=86400`; likes/profile routes get `private, no-store`; `*/count/**` like-count routes are public-cacheable. Catalog handlers still use Nitro's `defineCachedEventHandler` with `catalogCacheOptions()` (`server/utils/catalogCache.ts`) for a separate server-side cache - 1h `maxAge` + `swr` in production, `maxAge: 0` in dev - keyed by `${catalogSource}:${event.path}`.

**Styling (Tailwind v4).** Via the `@tailwindcss/vite` plugin - **no** `tailwind.config`/`postcss.config`. Theme tokens (light in `:root`, dark in `.dark` - source order matters since both are specificity-equal), the `dark` variant, and a global `input:-webkit-autofill` override (tied to `var(--foreground)`) live in `app/assets/css/tailwind.css` (`@theme` / `@theme inline`). A global forest-background overlay (`html::before`/`html::after` in `tailwind.css`, fixed/negative `z-index`) applies the same `trees-origin_v1.jpg` on every route at low opacity (0.33 light / 0.17 dark) under a green/white tint gradient - `body` no longer carries its own background-image. The homepage mounts `HomepageAtmosphere.vue` only on `/`, repeating the identical image+gradient treatment as a foreground layer (`z-index: 0`) behind the existing fractal/content layers. Default is dark (set pre-paint by an inline script in `app.head`, persisted in `localStorage['theme']`); `useTheme()` + `<ThemeToggle>` switch with a View Transitions circular reveal. Many components still hardcode `text-white/X` etc. (baked in for dark) - light theme is token-level only, not yet polished per-component.

**PWA.** Manual SW (no module): `public/custom-sw.js` (precache + offline fallback), registered by `app/plugins/pwa.client.ts` **in production only** (`import.meta.dev` guard) to avoid stale `localhost:3000` caches. Assets: `public/site.webmanifest`, `public/offline.html`. Run `npm run verify:pwa` after touching these.

**Images.** Prefer canonical `*_xl` fields with `<NuxtImg>` for rendered media. `OpenImage` accepts legacy `image_th`, but previews fall back to `image_xl` when no thumbnail exists, so records like `hagen` with only `photo_xl` still render.

**UI (shadcn-vue).** `components.json` (new-york). Primitives in `app/components/ui/*`, auto-imported via `~/components/ui` with `pathPrefix: false` + `extensions: ['vue']`; `cn()` in `app/lib/utils.ts`; built on reka-ui. Gotchas:
- Auto-import keys off the `.vue` **filename**, not the `index.ts` barrel - `Sonner.vue` → `<Sonner>`, not `Toaster`. Import explicitly when export name ≠ filename (`<Toaster>` in `app/app.vue`).
- **No** `@lucide/vue` despite `components.json` saying `lucide` - icons use `@nuxt/icon` with **lucide** as the UI set (`<Icon name="lucide:…" />`, native 24px/stroke-2) and **Simple Icons** for brands. Swap lucide imports after `shadcn-vue add`. Lucide has no solid variants - fill an outline icon by forcing SVG render mode and overriding the path's `fill="none"`: `<Icon name="lucide:heart" mode="svg" :class="liked && '[&_path]:fill-current'" />` (plain `fill-current` on the `<svg>` is beaten by the path's own `fill="none"`; mask/css mode has no path to target).
- **Brand icons → Simple Icons** (`<Icon name="simple-icons:…" />`); registry in `app/constants/icons.ts` maps each `IconKey` to a `simple-icons:*` name. A few marks Simple Icons lacks stay as custom SVG (`kind: 'svg'` / `img=`/`@nuxt/image`): JunoDownload, Amazon Music, Qobuz.
- No global `border-border` base layer (many bare `border` utilities rely on `currentColor`) - set borders per instance (auth Cards use `border-white/20`).
- **`font-mono` = Azeret Mono** for technical data: BPM, catalog numbers (`SR-042`), track duration (`4:32`), total release duration. Apply `font-mono` to any element rendering these values.
- **No `@apply` in `<style scoped>`** - Tailwind v4 treats scoped blocks as isolated CSS contexts; `@apply` throws `Cannot apply unknown utility class`. Move styles to `class=""` in the template, or add `@reference "tailwindcss"` as the first line of the scoped block. Pure CSS (transitions, animations) without `@apply` is fine.

**Netlify Edge Functions** (`netlify/edge-functions/`): `blocking.ts` (403 for PHP/WP/admin scanner probes), `redirects.ts` (legacy `.htm`/`.html` + dead platform links), `trailing-slash-add.ts` / `trailing-slash-remove.ts`.

**Constants.** `app/constants/nav.ts` (nav items + `inHeader`; `isNavActive()` for section-level active), `icons.ts` (icon registry - Iconify names + custom SVG URLs), `soclinks.ts` (social links).

**Types.** Shared types in `app/types/index.ts`. Entities extend `BaseEntity` (`slug`, `title`, `visible`, `date`); API responses typed `XxxResponse` as `Record<string, Xxx> | Xxx[]` for both backends.

**SEO.** Every public page calls `useSeoMeta()` (full OG + Twitter tags) plus `useCanonical()` (`app/composables/useCanonical.ts` - thin wrapper over `useAbsoluteUrl()` rendering `<link rel="canonical">`); brand defaults in `app/app.config.ts`; sitemap suppressed on `stage--` deploys.

**Sitemap.** `@nuxtjs/sitemap` sources URLs from `/api/__sitemap__/urls` (`server/api/__sitemap__/urls.get.ts`), backed by the pure, unit-testable `buildSitemapUrls()` (`server/utils/sitemapUrls.ts`) which reads the local `sentimony-db-export.json` export directly - **no** live Firebase/Supabase fetch. Track URLs reuse `parseTrackParagraph()` from `firebaseCatalog.ts` so slugs stay in sync with `/api/track/[id]`.

**Robots/noindex.** Auth pages (`/signin`, `/signup`, `/forgot-password`, `/reset-password`, `/confirm`) and `/profile/**` are noindexed via `routeRules` + `buildNoindexRouteRules()` (`server/utils/robotsPolicy.ts`, same pattern as `buildApiRouteRules()`) - **not** `definePageMeta({ robots: false })`, which silently no-ops in this project's Nuxt 4 + `@nuxtjs/robots` setup (`pageMetaRobots` stays `{}` in the compiled bundle; verified via `.nuxt/dev/index.mjs`). `routeRules` with `robots: false` also auto-excludes those paths from the sitemap, so no separate `sitemap.exclude` is needed.

**Artist `category_id` numbering.** `category_id` — унікальний тризначний рядок (`"001"`–`"238"` наразі), який задає порядок артистів і відображається як бейдж на картці. Для перших 226 артистів канонічні номери та порядок беруться з inline-коментарів `// NNN slug` у `/Users/ihororlovskyi/work/github/ihororlovskyi/sentimony-images/src/data/artist-images.ts`; порядок `server/data/sentimony-db-export.json` має повторювати цей список, пропускаючи дублікати фото.

Artist list page ordering: use `sortArtistsForCatalog()` (`app/utils/artists.ts`) everywhere, including the artists page and artist Swiper. `/artists/all` is the exception: it lists all artists (hidden included) via `/api/artists-all` + `sortArtistsByCategory()` (same sort, no `visible` filter). Categories render as `musician → dj → mastering → designer`; within each category sort by ascending numeric `category_id`.

Правило обчислення, якщо нумерацію треба відновити:
1. `irukanji` завжди `001` і стоїть першим як founder, незалежно від хронології релізів.
2. Далі йти за першою появою в `sentimony-nuxt/server/data/sentimony-db-export.json`: релізи за `releases[].date` від старих до нових, артисти всередині релізу за порядком у `releases[].artists`.
3. Події (`events`) інтерлівити за датою з релізами; нові учасники події отримують номер у момент першої появи.
4. Артисти без появи в релізах/подіях йдуть у хвіст, алфавітно за slug.

Відомі винятки й ручні поправки:
- `irukanji` — примусовий `001`.
- Ручні появи з `sentimony-images/CLAUDE.md`: `va-true-story` додає `iorlovskyi` і `zea`; event `shift-space` додає `hagen`.
- Slug-аліаси з даних релізів до реальних artist slug: `ers` → `e-r-s`, `alientime` → `alien-time`, `ka` → `ka-art`, також історично трапляються `36` → `thirty-sixth`, `anomalie` → `anomalie-in`, `braindrop` → `braindrop-in-dub`, `kd-expression` → `k-d-expression`.
- Коментарі `// not in artist db` у `artist-images.ts` не отримують `category_id`; `exoflux` наразі саме такий випадок.
- Хвіст без release connection: `astrocat` (`222`), `elisa-vargas-fernandez` (`223`), `gribessa` (`224`), `proff` (`225`), `tairam` (`226`).
- Додані в DB артисти, яких немає в `artist-images.ts`, мають номери `227`–`238` і стоять у DB за відомою першою появою: `flange`, `monno`, `1n0x`, `thirty-sixth`, `scarlet-crown`, `fivetimesno`, `paul-pazdan`, `stripes`, `pxeyes`, `stereodots`, `symetric`, `slamthings`.

Якщо додається новий артист: додати запис у `server/data/sentimony-db-export.json`, призначити наступний вільний тризначний `category_id`, поставити запис у порядок за правилами вище, а коли з'явиться фото — додати відповідний рядок у `sentimony-images/src/data/artist-images.ts`.

## Code style

Коментарів у коді уникаємо; код має бути самодокументованим через назви змінних і функцій. Якщо коментар справді потрібен, писати його англійською.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
