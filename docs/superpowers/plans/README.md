# Implementation Plans

Папка містить імплементаційні плани для рефакторингу та тестового покриття Sentimony Records. Усі плани написані у форматі `superpowers:writing-plans` — bite-sized tasks (2–5 хв на step), frequent commits, конкретні файли та команди.

Для виконання плану використовуй:
- **`superpowers:subagent-driven-development`** (рекомендую) — свіжий subagent на кожен task, рев'ю між тасками.
- **`superpowers:executing-plans`** — інлайн-виконання у поточній сесії з checkpoints.

---

## Рекомендована послідовність

```
1. vitest-setup ─┬─→ 2. server-route-tests ─┐
                 │                            │
                 ├─→ 3. component-tests ──────┼─→ 4. playwright-e2e ─→ 5. likes-factory
                 │                            │
                 └────────────────────────────┘
```

**Лінійний порядок (для виконавця, що не хоче розгалужень):**

~~1.~~ ~~2.~~ ~~3.~~ ~~4.~~ (✅ виконано) → 5.

Кожен наступний крок припускає, що попередні виконано. План 5 (`likes-factory`) має fallback-режим без тестів, але рекомендується мати safety-net з планів 1–4 перед рефакторингом.

---

## Плани

### ⚠️ [`2026-05-02-test-environments.md`](./2026-05-02-test-environments.md) — Supabase stage + migrations prerequisite

**Статус на 2026-05-03:** Task 1 schema частина фактично виконана на `sentimony-stage` (`fxznrlgeabeqqwqajchq`) через Supabase SQL Editor, бо `supabase db push` / `migration repair` з локальної мережі впираються в Supabase pooler timeout.

**Підтверджено:** baseline tables/policies присутні; `pg_tables.rowsecurity = true` для очікуваних public tables. `npx supabase --version` працює (`2.98.0`).

**Залишилось:** коли pooler/direct DB connection стабілізується, виконати `npx supabase migration repair 20260502235044 --status applied --db-url "$POOLER_DB_URL"` для sync migration history. До цього майбутній `db push` може намагатися повторно застосувати baseline.

### [`2026-05-03-api-cache-purge.md`](./2026-05-03-api-cache-purge.md) — Targeted Nitro API cache purge

**Мета:** Додати protected endpoint для точкового скидання Nitro API cache (`/api/releases` першим), щоб stale cached responses можна було прибирати без повного restart/redeploy.

**Контекст:** Після переходу local/stage на Supabase `/api/releases` може віддати старий Firebase response із `.nuxt/cache/nitro/handlers`, тоді list page показує 100+ релізів, а detail route для релізів поза stage subset дає 404. Tactical fix: dev no-cache для `/api/releases`; durable follow-up: deterministic cache keys + admin purge endpoint.

### ✅ 1. [`2026-05-01-vitest-setup.md`](./2026-05-01-vitest-setup.md) — Vitest infrastructure + baseline тести

**Виконано:** 2026-05-01.

**Мета:** Налаштувати Vitest + `@nuxt/test-utils` + `@vue/test-utils`, написати 5 unit-тестів на `useLikes` (release-likes) як baseline для майбутніх рефакторингів.

**Виходи:**
- `vitest.config.ts`, `tests/setup.ts`, `tests/utils/withSetup.ts`.
- `tests/composables/useLikes.spec.ts` (5 тестів — всі зелені).
- `npm test` / `npm run test:watch` скрипти.

**Відхилення від плану:**
- `tests/setup.ts` використовує `vi.hoisted()` замість прямих `const` (TDZ-проблема через хойстинг `mockNuxtImport`).
- `useLikes.spec.ts` додано `afterEach(() => wrapper.unmount())` — без демонтажу `watch`-ери з попередніх тестів витікали і ламали mock-послідовності у наступних.

**Залежності:** жодних (стартова точка).

---

### ✅ 2. [`2026-05-01-server-route-tests.md`](./2026-05-01-server-route-tests.md) — Серверні юніт-тести `/api/likes/*`

**Виконано:** 2026-05-01.

**Мета:** Покрити чотири release-likes endpoint-и (`GET /api/likes`, `POST /api/likes`, `DELETE /api/likes/[slug]`, `GET /api/likes/count/[slug]`) юніт-тестами з мок-Supabase. Захищає від поломок при майбутній міграції на `defineLikesHandler`-фабрику.

**Виходи:**
- `tests/utils/supabaseChainMock.ts`, `tests/utils/createMockEvent.ts`.
- `tests/mocks/supabase-server.ts` — stub для alias (додатковий файл поза планом).
- `tests/server/api/likes.spec.ts` (12 тестів — всі зелені).
- `vitest.config.ts` — додано `resolve.alias` для `#supabase/server` і `~~`.

**Відхилення від плану:**
- `vi.mock('h3', ...)` і `vi.mock('~~/server/utils/supabaseAdmin', ...)` **не працюють** для Nitro-handlers — `supabaseAdmin`, `readBody`, `getRouterParam`, `createError` є auto-imports (globals), а не explicit module imports. Замінено на `vi.stubGlobal(...)` для всіх чотирьох.
- Потрібний alias `#supabase/server` у `vitest.config.ts` + stub-файл `tests/mocks/supabase-server.ts` — без цього `vi.mock('#supabase/server')` не резолвиться у nuxt client environment.
- `defineEventHandler` stub додано у `tests/setup.ts` (передбачено планом у Notes, але тут обов'язково).

**Залежності:** План 1.

---

### ✅ 3. [`2026-05-01-component-tests.md`](./2026-05-01-component-tests.md) — Component-тести нетривіальних компонентів

**Виконано:** 2026-05-01.

**Мета:** Покрити Vue-компоненти, що мають conditional logic або інтерактивну поведінку: `Item.vue` (умовні бейджі + like-button), `Tabs.vue` (клавіатурна навігація + ARIA), `OpenImage.vue` (Esc + backdrop), `OpenSidebar.vue` (Esc + scroll-lock + ARIA).

**Виходи:**
- `tests/utils/mountWithStubs.ts` — helper з дефолтними stubs (ClientOnly, Icon, NuxtLink, v-wave).
- `tests/components/Item.spec.ts`, `Tabs.spec.ts`, `OpenImage.spec.ts`, `OpenSidebar.spec.ts` (18 тестів — всі зелені).
- `tests/setup.ts` — додано `document.body.style.overflow = ''` reset у `beforeEach`.

**Відхилення від плану:**
- `NuxtLink` stub у `mountWithStubs` потребує передавати `{ isActive: false, isExactActive: false }` у скоупований slot — без цього `Item.vue` (що використовує `v-slot="{ isActive }"`) падає з `TypeError: Cannot destructure property 'isActive' of 'undefined'`. Дефолтний `mountSuspended` не вирішує це автоматично.
- `OpenImage.spec.ts` і `OpenSidebar.spec.ts` для тестів закриття (Esc, backdrop-click) потребують `Transition: { template: '<div><slot /></div>' }` stub безпосередньо у тесті — інакше `<Transition leave-active>` затримує видалення DOM у happy-dom і `wrapper.find('.fixed.inset-0')` повертає `true` після закриття.

**Залежності:** План 1 (потребує Vitest + `mountSuspended`).

**Можна виконувати паралельно з планом 2** — вони не перетинаються (server vs component layer).

---

### ✅ 4. [`2026-05-01-playwright-e2e.md`](./2026-05-01-playwright-e2e.md) — Playwright E2E smoke

**Виконано:** 2026-05-02.

**Мета:** Покрити два critical user-flow E2E-смоками: (a) login + like-cycle release; (b) mobile menu open/close. Інтеграційне покриття Nuxt SSR ↔ Supabase auth ↔ likes API.

**Виходи:**
- `playwright.config.ts`, `tests/e2e/global-setup.ts`, `tests/e2e/global-teardown.ts`.
- `tests/e2e/helpers/supabase-admin.ts`, `tests/e2e/helpers/auth.ts`.
- `tests/e2e/login-and-like.spec.ts`, `tests/e2e/mobile-menu.spec.ts` (3 тести — всі зелені).
- `npm run test:e2e` / `test:e2e:ui` / `test:e2e:headed` скрипти (вже були в `package.json`).
- `vitest.config.ts` — додано `exclude: ['tests/e2e/**']`.

**Відхилення від плану:**
- `global-setup.ts` зроблено умовним: якщо `E2E_TEST_RELEASE_SLUG` не задано — user не створюється і auth тест пропускається (`test.skip`). Mobile-menu тести працюють без auth.
- `.env.stage` замість `.env.local` у `loadDotenv()` (глобальне налаштування проєкту).
- `likeBtn` selector: `:text-is("Like")` і `hasText: /^Like\b/` не працюють для text-вузлів у `filter`. Фікс → `getByRole('button', { name: /^Like$/ })`.
- `likedBtn` потребує regex `/^Liked/` без `exact: true`, бо кнопка показує "Liked 1" (з лічильником) — `exact: 'Liked'` не матчив.
- `waitForLoadState('networkidle')` не резолвиться через Nuxt HMR WebSocket. Фікс → `page.waitForResponse(r => r.url().includes('/api/likes') && r.request().method() === 'POST')` перед кліком.
- `page.waitForLoadState('networkidle')` після goto не потрібен; натомість достатньо `waitForResponse` для count endpoint (`.catch(() => {})` якщо не спрацює).
- Vitest підхоплював E2E spec-файли через `include: ['tests/**/*.spec.ts']`. Фікс → `exclude: ['tests/e2e/**']` у `vitest.config.ts`.
- `loginViaUI` потребує `waitForLoadState('networkidle')` після `goto('/login')` і збільшеного timeout 20s для `waitForURL('/profile')` (Supabase auth може бути повільним при першому запиті).

**Залежності:** Плани 1–3 рекомендовані. Потребує `supabase-stage` проєкту і `E2E_TEST_RELEASE_SLUG` для login+like тесту.

---

### 5. [`2026-05-01-likes-factory.md`](./2026-05-01-likes-factory.md) — Уніфікація likes-композаблів через `createLikes`

**Мета:** Замінити шість майже ідентичних likes-композаблів (`useLikes`, `useArtistLikes`, `useTrackLikes`, `useEventLikes`, `usePlaylistLikes`, `useVideoLikes`) на одну фабрику `createLikes()` без зміни публічного контракту. Виграш ≈67% LOC (~346 → ~115 рядків).

**Виходи:**
- `app/composables/createLikes.ts`.
- 6 переписаних композаблів (`use<Entity>Likes.ts` як thin wrappers).
- 5 додаткових spec-файлів (`tests/composables/use<Entity>Likes.spec.ts` — Task 0).
- 6 синхронізацій `beforeEach` із новими useState-ключами.

**Час:** ~3–4 год (з тестами).

**Залежності:**
- **З тестами (рекомендовано):** Плани 1–3 (план 4 не обов'язковий, але корисний як final smoke у Task 8).
- **Без тестів (fallback):** жодних — план має explicit fallback-режим, де `npm test` кроки замінюються на manual smoke у dev. Менш безпечно, але робоче.

**Тести покривають:** load on mount, optimistic toggle, rollback on error, login-redirect для гостя, `setTrackCount` для track-композабля (race-захист alias-mapper).

---

## Загальна тестова матриця після виконання всіх планів

| План | Категорія | Тестів |
|---|---|---|
| 1 | composable (useLikes) | 5 |
| 2 | server-api | 12 |
| 3 | component | 18 |
| 5 (Task 0) | composable (5 entities) | 25 |
| **Сума unit/component (`npm test`)** | | **60** |
| 4 | E2E (`npm run test:e2e`) | 3 |
| **Усього** | | **63** |

Час прогону: `npm test` <15s, `npm run test:e2e` ~30–60s.

---

## Refactoring backlog

Список ідей з аудиту home / releases / release detail / profile сторінок. Повний опис кожного пункту — у `CLAUDE.md → Refactoring backlog` (з `Why` / `How to apply`). Тут — короткий огляд для планування. Пункти, для яких уже є імплементаційний план, помічено `📋`.

### High impact — code duplication

1. 📋 **Likes-фабрика** → див. план [`likes-factory`](./2026-05-01-likes-factory.md). Об'єднати 6 майже ідентичних likes-композаблів (`useLikes`, `useArtistLikes`, …) в один `createLikes()`. Скорочення ~346 → ~115 рядків.
2. **Уніфікувати list-сторінки.** `releases.vue`/`artists.vue`/`events.vue`/`videos.vue`/`playlists.vue`/`tracks.vue` повторюють `useXxx()` → `toArray<T>()` → `filter+sort` → `useSeoMeta` → `<Item v-for>`. Витягнути `useSortedByDate`, `useDefaultSeo`, `<EntityList>`. ~120 рядків бойлерплейту мінус.
3. **Relative-резолв на сервер.** `release/[id].vue` тягне `useReleases()` + `useArtists()` лише для «Relative Releases/Artists». Перенести в `/api/release/[id]` (повертати `relative_releases_full` + `relative_artists_full` уже резолвлені). −2 fetch на detail, −клієнтська computed-сортування.

### High impact — release/[id].vue (446 рядків)

4. **`<MediaPlayers>` компонент.** Витягнути блок `<Tabs>` з 4 iframe-плеєрами (Bandcamp/YouTube/SoundCloud/YT Music) у переюзовуваний компонент. Lazy-mount iframe лише активної вкладки.
5. **`<EntityLinks>` компонент.** Замінити ~14 хардкоднутих `<BtnPrimary v-if=...>` декларативним списком з `app/constants/platforms.ts`. Переюз на release/track/artist detail.
6. **Видалити фрагільний CSS `.tracks-N`.** Замінити `BandcampIframe.tracks-1..27` обчисленим `:style="{ height: bandcampHeight(n) + 'px' }"`. Зараз ламається для tracks-number поза переліком.
7. **`useFetch('/api/tracks/...')` → `useAsyncData`.** SSR-консистентність. Локальний тип `Track` → спільний з `app/types/index.ts`.
8. **Виправити невалідну розмітку tracklist.** `<p v-for><NuxtLink>...<button></button></NuxtLink></p>` — `<p>` не може містити блокові елементи; `<button>` всередині `<a>` — невалідно. Замінити на `<ol>` + `<li class="flex">`.
9. **404-throw підняти над `onMounted`.** Зараз `onMounted` (рядки 12–15) використовує `item.value!` ДО `await useRelease()`. Працює завдяки TDZ, але читається як баг.
10. **`<MediaComingSoon>` компонент.** Дублікат `comingImage` патерну з `OpenImage.vue`.

### Medium impact — home / list

11. **Винести about-копію з `index.vue`.** ~8KB HTML-літерал у `<script setup>` → `app/constants/about.ts`. Видалити мертві `logoNew{v2,v3}`. Узгодити лінк-кольори з DESIGN.md §2.1.
12. **Контейнер: одна шкала.** `max-w-[112rem]` у list-сторінках vs `max-w-7xl` у DESIGN.md §2.3 — або привести list до `max-w-7xl`, або задокументувати «wide grid» токен.
13. **`<PageTitle>` компонент.** `<h1 class="text-2xl md:text-4xl my-4 md:my-6">` повторюється на кожній list-сторінці.

### Medium impact — UX / A11y

14. **Like-button на release detail — focus-visible парність** до `hover:bg-white/10` / `hover:text-white/70`.
15. **`hover:underline` на tracklist** — додати `focus-visible:underline`.
16. **Breadcrumb / "back to releases"** на detail-сторінках.
17. **Section labels семантика.** `<small><b>Tracklist:</b></small>` → `<h2>` зі styled label-класом.

### Low impact — polish

18. **iframe lazy-mount + `Fractal` reduced-motion** (TODO з DESIGN.md §5).
19. **`comingImage` snowman** — обернути `⛄` у `<span aria-hidden="true">` (порушує DESIGN.md §10).
20. **`/api/tracks/[release_slug]` → `/api/release/[slug]/tracks`** (або вкласти tracks безпосередньо в release payload).

### Profile page (`pages/profile.vue` + `usePaginatedLikes`)

21. **`<LikedSection>` компонент** замість 6× повторюваного template-блоку (~80 рядків мінус).
22. **`defineLikedEntitiesHandler`-фабрика на сервері.** 6 хендлерів `*-likes/{entity}.get.ts` копія-в-копію. Дзеркалить пункт 1 на сервері. ~150 рядків серверного коду мінус.
23. **`/api/me/dashboard` one-shot endpoint** замість 6 паралельних запитів на mount.
24. **STEP magic numbers** (`5`/`20` у тексті кнопок «Show more») винести в const.
25. **`font-['Julius_Sans_One']` → `font-julius`** (token з DESIGN.md §2.2). 7× у `profile.vue`, ще в `login.vue`.
26. **`noindex` для `/profile`/`/login`/`/confirm`.**
27. **Track-лінк → `/track/[slug]`** (зараз `/release/[release_slug]` — функціональний баг, ігнорує існуючу track-detail сторінку).
28. **Empty state** для нових користувачів без лайків.
29. **Track-list розмітка непослідовна** з рештою секцій (відсутні `v-wave` і focus-visible).
30. **`signOut` → `await navigateTo('/login', { replace: true })`** (back-кнопка не повертає).
31. **`Liked*` локальні типи → `Pick<Release,...>`** зі спільних типів.
32. **A11y «Show more»** — `aria-controls` + `aria-live` на списках.
33. **Visible-фільтр непослідовний.** `likes/releases.get.ts` фільтрує `visible=true`, `track-likes/tracks.get.ts` — ні. Треки з прихованих релізів ведуть на 404.

### Рекомендована послідовність виконання

З CLAUDE.md: **1 → 7 → 4 → 5 → 2 → 3 → 6 → решта.**

Логіка:
- **1** (likes-фабрика) — автономний, найбільший виграш у LOC.
- **7** (useFetch fix) — мінімальна фіксація бага.
- **4–5** — розвантажують найбільший файл (release/[id].vue, 446 рядків).
- **2–3** — після спрощення detail-сторінок легше уніфікувати list.
- **6** — робити одночасно з 4, бо CSS-фікс там же.
- **Profile page (21–33)** — паралельно з 22 (mirror на сервер) поряд з пунктом 1.

---

## Конвенції

- Усі плани мають `# Implementation Plan` header з `Goal` / `Architecture` / `Tech Stack`.
- Кожен Task має `**Files:**` блок з explicit `Create` / `Modify` шляхами.
- Кожен Step — actionable і коммітиться окремо (frequent commits).
- Жодних placeholder-ів (`TBD`, `implement later`) — повний код у кожному Step-і.
- Verification per Task через `npm test` + `vue-tsc` + grep + (опційно) manual smoke.
- Notes наприкінці кожного плану — troubleshooting + roadmap для наступних кроків.

### Після виконання плану — обов'язково

1. **`CLAUDE.md`** — оновити секцію `### Testing` (або іншу відповідну) з новими файлами, патернами та будь-якими відхиленнями від очікуваної поведінки (наприклад, нові stub-правила, quirks test environment).
2. **Цей `README.md`** — позначити план як `✅`, вказати дату виконання, заповнити «Виходи» та «Відхилення від плану», оновити «Лінійний порядок».

---

## Як додати новий план

1. Назва файлу: `YYYY-MM-DD-<feature-name>.md`.
2. Запустити skill `superpowers:writing-plans` — він використовує цей формат.
3. Додати запис у цей README з коротким описом, виходами, часом, залежностями.
4. Оновити «Рекомендовану послідовність», якщо план вписується у наявний ланцюг.
