# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sentimony Records — JAMstack portfolio website for a psychedelic music label. Built with Nuxt 4 (SSR via Netlify serverless), Supabase (auth + likes), Firebase Realtime Database (content source), and Tailwind CSS.

Live: [sentimony.com](https://sentimony.com) · Staging: `stage--sentimony-nuxt.netlify.app`

Security
- Never print secrets or full environment variable values.
- Use placeholders for secrets in examples.
- `.env.prod` НІКОЛИ не комітити — service_role key дає повний доступ до БД.
- `sync:supabase:prod` запускати свідомо. Захисний `--confirm` prompt — Roadmap (див. `docs/superpowers/specs/2026-05-02-test-environments-design.md` Section 6 R4).

## Git policy

- Користувач коммітить руками. Не запускати `git commit` / `git push` в Bash, навіть якщо skill (brainstorming, writing-plans, executing-plans, subagent-driven-development) пропонує commit-крок.
- Замість commit-кроку — лишати файли як unstaged/untracked і нагадувати user-у `[user commits manually]`. У планах commit-кроки писати у тому самому форматі (без bash-команди).
- Виняток: якщо user **прямо** просить «закомітити» у поточному запиті.
- Запропонований commit-меседж можна вивести як текст у відповідь — користувач скопіює.

## Commands

```bash
# Development (вимагає .env.stage; .env.prod лише для escape hatch)
npm run dev               # → supabase-stage, з --host (default workflow)
npm run dev:prod          # escape hatch: дебаг прод-багу

# Build & deploy
npm run build
npm run deploy:stage
npm run deploy:prod

# Tests
npm test                  # vitest unit/component (run all once)
npm run test:watch        # vitest watch mode
npm run test:e2e          # → supabase-stage, обов'язково
npm run test:e2e:ui       # Playwright UI mode

# Sync data sources
npm run sync:firebase             # exports Firebase DB → public/data/sentimony-db-export.json
npm run sync:supabase:stage       # 10 топ-артистів + 10 свіжих релізів + всі events/videos/playlists/tracks
npm run sync:supabase:prod        # повний sync, тільки для прода

# Database migrations (Supabase CLI)
supabase migration new <name>     # нова schema-міграція
supabase db push                  # apply до залінкованого проєкту (stage/prod)
supabase db diff --linked         # діфф локальної schema vs залінкованого проєкту
```

`.env.stage` (default) і `.env.prod` (escape hatch) обидва мають містити: `NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_KEY`, `NUXT_SUPABASE_SECRET_KEY`. `.env.stage` також має містити `RELEASES_SOURCE=supabase`, інакше content API fallback-иться на Firebase export. Опційно у `.env.stage`: `E2E_TEST_RELEASE_SLUG=<slug>`. Reference template — `.env.example` (committed).

## Environments

Три деплой-environment-и шерять два Supabase-проєкти:

| Environment | Trigger | Supabase project | Env-vars джерело |
|---|---|---|---|
| Local | `npm run dev` | `supabase-stage` | `.env.stage` |
| Stage | Netlify deploy-preview / branch-deploy | `supabase-stage` | Netlify UI (per-context) |
| Prod | Netlify production (master) | `supabase-prod` | Netlify UI (per-context) |

**Invariants:**
- `npm run dev` за замовчуванням → stage. Запустити проти prod можна тільки явно через `npm run dev:prod` (escape hatch).
- `npm run test:e2e` обов'язково через `.env.stage`. Жоден E2E не торкається prod-БД.
- Schema живе у `supabase/migrations/` як single source of truth (див. секцію Database migrations).
- Netlify per-context env-vars налаштовані через Site settings → Environment variables. `netlify.toml` НЕ містить keys — все через UI для consistency.

Detail design: `docs/superpowers/specs/2026-05-02-test-environments-design.md`.

## Database migrations

Schema-зміни виключно через `supabase/migrations/*.sql`. **Жодних змін через Supabase web UI** — це порушує єдине джерело правди і призведе до schema-drift між stage і prod.

Workflow:

```
1. supabase migration new <name>          # створює <ts>_<name>.sql
2. Заповнити SQL вручну (CREATE/ALTER/...)
3. supabase link --project-ref <stage-ref>
4. supabase db push                        # apply до stage
5. npm run dev → smoke
6. npm run sync:supabase:stage             # якщо нова таблиця/колонка потребує даних
7. npm test && npm run test:e2e
8. [user commits manually]
9. supabase link --project-ref <prod-ref>
10. supabase db push                       # apply до prod
11. npm run deploy:prod
```

Recovery:
- Stage broken → `supabase db reset --linked` (зносить stage, реаплаїть всі міграції) → `npm run sync:supabase:stage`.
- Prod не зачіпається до кроку 10. Якщо помилка на 9-10 — видалити migration файл, виправити, повторити.

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

Likes redirect unauthenticated users to `/login`. The `useLikes()` composable at `app/composables/useLikes.ts` is the release-likes implementation; entity-specific variants (artists, videos, tracks, events, playlists) follow the same pattern.

The `toArray()` helper (`app/composables/toArray.ts`) normalises Firebase object-keyed responses and Supabase array responses into a uniform array.

### Pages & routing

All pages are in `app/pages/`. Pattern: list page (`releases.vue`) + detail page (`release/[id].vue`). The `Item` component is the universal card used across all list pages.

### Rendering strategy (ISR)

In production, most routes use ISR with `maxAge: 86400` (configured in `nuxt.config.ts` `routeRules`). ISR is intentionally disabled in dev to avoid a known `unstorage` ENOTDIR bug. API routes are CDN-cached for 1 hour with 24-hour SWR.

### Middleware

- `app/middleware/auth.ts` — redirects unauthenticated users to `/login`; applied on protected routes (`/profile`, etc.)

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

### Testing

Vitest + `@nuxt/test-utils` + `@vue/test-utils` + happy-dom. Конфіг: `vitest.config.ts` (`environment: 'nuxt'`, `setupFiles: tests/setup.ts`).

- `tests/setup.ts` — глобальні моки: `useSupabaseUser` → `userMock` (ref), `navigateTo` → `navigateToMock` (vi.fn()), `$fetch` → `vi.stubGlobal` у `beforeEach`, `document.body.style.overflow = ''` reset (для компонентів з scroll-lock). Моки оголошені через `vi.hoisted()` (необхідно через хойстинг `mockNuxtImport`).
- `tests/utils/withSetup.ts` — хелпер для виклику композаблів у Vue-контексті (потрібно для `onMounted`/`useState`). Повертає `{ result, wrapper }`. **Завжди викликати `wrapper.unmount()` в `afterEach`** — інакше `watch`-ери з попередніх тестів витікають і ламають mock-послідовності.
- `tests/utils/mountWithStubs.ts` — обгортка над `mountSuspended` з дефолтними stubs: `ClientOnly` (pass-through), `Icon` (`<i class="icon-stub" data-name="...">` для перевірки іконок), `NuxtLink` (передає `{ isActive: false, isExactActive: false }` у скоупований slot — **критично**: без цього компоненти що використовують `v-slot="{ isActive }"` падають з TypeError), `v-wave` (no-op директива). Кожен stub можна перевизначити через `options.global.stubs`.
- `tests/composables/` — unit-тести для composables.
- `tests/components/` — component-тести: `Item.spec.ts` (4 тести: бейджі, like-button), `Tabs.spec.ts` (6 тестів: keyboard nav, ARIA), `OpenImage.spec.ts` (4 тести: Esc, backdrop-click), `OpenSidebar.spec.ts` (4 тести: Esc, scroll-lock, ARIA). Для модалок що мають `<Transition>` — додавати `global: { stubs: { Transition: { template: '<div><slot /></div>' } } }` у конкретному тесті, щоб CSS-transition не затримував закриття у happy-dom.
- `tests/server/api/` — unit-тести для Nitro handlers. **Важливо:** Nitro auto-imports (`supabaseAdmin`, `getRouterParam`, `readBody`, `createError`) є globals у runtime, тому їх не можна перехопити через `vi.mock` — використовувати `vi.stubGlobal(...)`. `#supabase/server` потребує alias у `vitest.config.ts` → `tests/mocks/supabase-server.ts`.
- `tests/mocks/` — stub-файли для модулів, що не резолвляться у test environment.
- `tests/utils/supabaseChainMock.ts` — chainable Supabase mock factory для server-route тестів.
- `tests/e2e/` — Playwright E2E smoke тести (виключені з Vitest через `exclude: ['tests/e2e/**']` у `vitest.config.ts`).
  - `global-setup.ts` / `global-teardown.ts` — умовні: створюють/видаляють test-user тільки якщо `E2E_TEST_RELEASE_SLUG` задано. Завантажують `.env.stage` через `dotenv`.
  - `helpers/supabase-admin.ts` — service-role client для lifecycle операцій.
  - `helpers/auth.ts` — `loginViaUI(page)`: goto `/login` + `waitForLoadState('networkidle')` + fill + click + `waitForURL('/profile', { timeout: 20_000 })`. Довший timeout потрібен бо Supabase auth повільний при першому запиті.
  - `login-and-like.spec.ts` — login → like → reload → verify → unlike. Селектор: `getByRole('button', { name: /^Like$/ })` і `getByRole('button', { name: /^Liked/ })` (без `exact`, бо кнопка показує "Liked N" з лічильником). Перед кліком — `waitForResponse` для POST/DELETE `/api/likes` (не `networkidle` — Nuxt HMR WebSocket не дає йому resolve).
  - `mobile-menu.spec.ts` — viewport 375px, ARIA attributes, body scroll-lock, Esc close. Не потребує auth.

## Code style

Коментарі в коді не використовуємо. Код має бути самодокументованим через назви змінних і функцій.

---

## Refactoring backlog

See [`docs/refactoring-backlog.md`](docs/refactoring-backlog.md) — 33 пункти з пріоритетністю та sequencing.
