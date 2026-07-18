# Адаптація сінків до нової структури export + ROADMAP пункти 2, 4, 7

Дата: 2026-07-18. Гілка: `json-to-yml`.

## Контекст

`server/data/sentimony-db-export.json` реструктуровано (комміт `1cb97b5 rework all objects`):

- `artists` (242), `tracks` (770), `videos`, `events`, `friends` — тепер **масиви** об'єктів зі `slug` усередині (раніше — об'єкти за slug);
- `releases` (102) і `playlists` (5) — як і раніше **об'єкти за slug**;
- кожен release зберігає `tracklist: string[]` (упорядковані track slugs);
- паралельно з'явився `server/data/sentimony-db.yml` + скрипти `convert-json-yml.mjs` / `convert-yml-json.mjs` (структурно-агностичний roundtrip, змін не потребують).

Аудит впливу нової структури:

- **Ламається:** `scripts/sync-firebase.mjs` (`Object.entries` на масиві дає числові ключі; масиви пішли б у Firebase як масиви й зламали path lookup `fetchFirebaseEntity`); локальне дзеркало `scripts/sync-field.mjs` (`db[table]?.[slug]` → `undefined` для масивних колекцій; тягне за собою `sync-track-audio.mjs`).
- **Тихо застаріло:** тип `SitemapCatalogExport` у `server/utils/sitemapUrls.ts` (рантайм виживає через `entity.slug ?? key`, але тип бреше); фікстура `tests/unit/sitemapUrls.test.ts`; одноразовий `scripts/migrate-tracks-export.mjs` при повторному запуску регенерує стару форму.
- **Працює без змін:** `scripts/sync-supabase.mjs` (`Object.values` на масиві повертає елементи), всі `/api/*` endpoints і сторінки (читають Firebase/Supabase, не export), `app/pages/tracks.vue`.

ROADMAP пункт 2 (`/tracks` data contract) фактично вже вирішений: сторінка споживає `/api/tracks` → `fetchAllCatalogTrackRows()` і поля `track_number`/`bpm`/`audio_url`; `tracklistCompact`/`tracks_number` з `useReleases()` не читає. Лишилося верифікувати тестом і закрити пункт.

## Ухвалені рішення

1. **Firebase — мінімальна підтримка:** сінк адаптуємо, щоб не псував дані й зберігав об'єктну форму в Firebase; нові фічі (`track_artists`, `like_counters`) — Supabase-only; Firebase read paths лишаються на поточному in-memory fallback.
2. **Публічні лічильники лайків — агрегати в БД** (таблиця `like_counters`, підтримувана RPC), а не `SUM` на льоту.
3. **Export лишається на CSV** (`artist_slug: "a,b"` / `artist_name`) як канонічній формі; `track_artists` — похідна таблиця, яку наповнює сінк.
4. **Пункт 2 закривається верифікацією** (тест + live-перевірка + перенос у «Закрито»), без змін коду сторінки.

Роботу оформлено одним дизайном із чотирма послідовними фазами.

## Фаза 1 — адаптація до нової структури export

Принцип: бекенди не змінюють форм (Firebase — об'єкти за slug, Supabase — рядки таблиць); адаптація відбувається на межі «export → сінк» і в єдиному рантайм-споживачі export (sitemap).

- **`scripts/sync-firebase.mjs`:** хелпер `bySlug(rows)` = `Object.fromEntries(rows.map(r => [r.slug, r]))`; застосувати до `artists`, `tracks` (зі збереженням поточної фільтрації полів `bpm`/`audio_url`), `videos`, `events`, `friends`. `releases`/`playlists` — пропускати як є.
- **`scripts/sync-field.mjs`:** локальне дзеркало для масивних колекцій шукає запис через `find(r => r.slug === slug)`; для `releases`/`playlists` — стара логіка за ключем. Supabase-частина без змін. `sync-track-audio.mjs` лагодиться автоматично (делегує сюди).
- **`scripts/migrate-tracks-export.mjs`:** видалити (одноразова міграція вже застосована; git-історія зберігає файл).
- **`server/utils/sitemapUrls.ts`:** тип `SitemapCatalogExport` — масивні колекції як `SitemapEntity[]`, `releases`/`playlists` — `Record`; ітерацію спростити з `Object.entries` на прохід масивом; прибрати `as unknown as` каст у `server/api/__sitemap__/urls.get.ts`; оновити фікстуру `tests/unit/sitemapUrls.test.ts` на масивну форму.
- **Сторінки:** кодових змін не потрібно. Верифікація: `npm run test:unit`, `npx nuxi typecheck`, локальний smoke `/tracks`, `/artists`, `/release/[id]`, `/track/[id]` в обох режимах `CATALOG_SOURCE`.
- Сінки під час імплементації **не запускаються** (пишуть у remote); після мержа їх запускає користувач.

Обробка помилок — як зараз: сінк-скрипти падають із `process.exit(1)` на першій помилці; sitemap — чиста функція без IO.

## Фаза 2 — закриття ROADMAP пункту 2 (`/tracks`)

- Юніт-тест на `fetchAllCatalogTrackRows` (мок обох бекендів): непорожній результат, коректний `track_number` із позиції в `tracklist`.
- Live-перевірка `/tracks`: непорожній список, коректні лічильники «N releases / M tracks».
- Перенести пункт 2 у розділ «Закрито з попередніх аудитів» ROADMAP.

## Фаза 3 — нормалізація track↔artist (ROADMAP пункт 7)

**Міграція `supabase/migrations/20260718_track_artists.sql`:**

- `track_artists(track_slug text references tracks(slug) on delete cascade, artist_slug text not null, position int not null, primary key (track_slug, artist_slug))` + індекс за `artist_slug`;
- без FK на `artists` (у CSV трапляються slug-и гостей, відсутніх у таблиці `artists`);
- RLS: public read, як в інших content-таблицях;
- застосування через workaround `db query --linked --file` з AGENTS.md (не `db push`).
- Окрема таблиця `release_tracks` **не** створюється: зв'язок release↔track лишається `releases.tracklist` (jsonb); вибірка треків релізу йде PK-lookup'ом `tracks.slug in (tracklist)`.

**Наповнення (`scripts/sync-supabase.mjs`):**

- чиста функція `buildTrackArtistRows(tracks)`: спліт CSV `artist_slug` по комі, trim, пропуск порожніх (32 треки без артиста не дають рядків), `position` = індекс у CSV;
- запис: upsert з `onConflict: 'track_slug,artist_slug'` + видалення пар, яких більше немає (за зразком наявного stale-tracks cleanup); каскад від `tracks` прибирає рядки видалених треків.
- читання наявних `tracks` і `track_artists` пейджиться через `.range()` зі стабільним сортуванням, щоб PostgREST cap у 1000 рядків не приховував stale-записи.

**Read paths (тільки Supabase-режим; Firebase — поточний in-memory fallback без змін):**

- **Similar tracks** (`server/api/track/[id].get.ts`): замість читання всіх треків і фільтрації в пам'яті — індексовані запити: artist slugs поточного трека з `track_artists` → `track_slug` з тим самим артистом → дотягнути треки за PK. Форма відповіді не змінюється.
- **Artist tracks** (`server/api/artist/[id]/tracks.get.ts`): фільтр по артисту через `track_artists.artist_slug = id`; контекст релізу/`track_number` — з кешованої мапи релізів, як зараз.
- `track_artists` є оптимізацією, а не обов'язковою залежністю: помилка lookup або порожній результат повертає керування CSV matching. Для similar tracks порожній co-artist `Set` теж означає CSV fallback, бо після успішного першого lookup коректний індекс мав би містити щонайменше поточний трек.
- CSV-поля `artist_name`/`artist_slug` у DTO та `splitTrackArtists` на клієнті лишаються display-формою; UI без змін.

**Тести:** юніт на `buildTrackArtistRows` (мультиартист, порожній CSV, trim); юніт на similar-tracks логіку з мокнутим Supabase-клієнтом із перевіркою index-шляху, порожньої таблиці, помилки другого co-artist lookup і Firebase fallback.

**Порядок після мержа:** міграція → `npm run sync:supabase` (наповнює `track_artists`) → smoke `/track/[id]`, `/artist/[id]`.

## Фаза 4 — відокремлення лічильників лайків від content DTO (ROADMAP пункт 4)

**Міграція `supabase/migrations/20260718_like_counters.sql`:**

- `like_counters(entity text, slug text, total bigint not null default 0, primary key (entity, slug))`, `entity` ∈ {release, artist, track, video, event, playlist};
- RLS: public read; запис — тільки через RPC;
- розширення security-definer RPC `increment_like`: у тій самій транзакції після інкремента per-user рядка — upsert `total = total + 1` у `like_counters` (entity виводиться з наявного whitelist `p_table`); тригери не потрібні, бо всі інкременти йдуть через RPC;
- backfill у тій же міграції: `insert … select slug, sum(count) … group by slug` з усіх шести `*_likes` таблиць.
- `track_plays` поза скоупом.

**Публічні count endpoints:**

- по одному батч-endpoint на тип сутності, відповідь `{ slug, total }[]` з `like_counters` за `entity`;
- шляхи — під наявні правила `${base}/count/**` у `server/utils/cachePolicy.ts`, за зразком naming `likedItemsRoutes`: `/api/likes/count/releases`, `/api/artist-likes/count/artists`, `/api/track-likes/count/tracks`, `/api/video-likes/count/videos`, `/api/event-likes/count/events`, `/api/playlist-likes/count/playlists`;
- у `cachePolicy.ts` для `${base}/count/**` замінити `publicCacheRule` (1 год) на новий `countCacheRule` з коротким TTL: `Netlify-CDN-Cache-Control: public, max-age=60, stale-while-revalidate=300` — інакше лічильники будуть годину стояти на місці;
- батч покриває і detail-сторінки, і списки (найбільший — tracks, ~770 рядків `slug`+int);
- читання `like_counters` пейджиться через `.range()` зі стабільним сортуванням, щоб відповідь не обрізалась на 1000 рядках;
- `server/utils/likeCounts.ts` (`SUM` на льоту в catalog-відповідях) стає непотрібним — count endpoints читають `like_counters` напряму.

**Чистка content DTO:**

- прибрати `like_count` зі спредів у `release/[id]`, `artist/[id]`, `video/[id]`, `playlist/[id]`, `event/[id]`;
- прибрати `likeCount` з відповіді `track/[id].get.ts`;
- прибрати `like_count` з рядків `tracks/[release_slug].get.ts` і `artist/[id]/tracks.get.ts`;
- прибрати опційні `like_count?` з типів у `app/types/index.ts`.

**Клієнт:**

- у фабриці `createLikes` — гідрація лічильників із count endpoint замість content-відповіді; правило `Math.max(local, server)` у `setCount`/`setTrackCount` зберігається;
- сторінки перестають передавати `like_count` з content у likes store;
- падіння count-запиту некритичне: UI показує локальний optimistic state, а `countsLoaded` скидається для повторної спроби на наступному mount.

**Тести:** юніт на count endpoint (мок admin client); юніт на merge-логіку `createLikes`; після міграції — ручна звірка backfill (`total` = `SUM(count)`) через `db query`.

**Порядок розгортання:** спершу міграція, потім deploy коду — інакше між deploy і міграцією лічильники на сторінках тимчасово нульові (content уже без `like_count`, endpoint ще без таблиці).

## Верифікація всього проєкту

- `npm run test:unit` (очікуваний baseline після review follow-up: 39 files / 161 tests);
- `npx nuxi typecheck`;
- `npm run build`;
- локальний smoke ключових сторінок в обох `CATALOG_SOURCE` режимах (web-debug);
- сінки й міграції застосовуються користувачем (або з його явного дозволу) у порядку: міграції → deploy → `sync:supabase` → `sync:firebase`.

## Поза скоупом

- Firebase-паритет для `track_artists`/`like_counters` (рішення: Supabase-only).
- `release_tracks` join-таблиця.
- `track_plays` агрегація.
- Зміни UI/дизайну сторінок; ROADMAP пункти 1, 3, 5, 6, 8–13.
