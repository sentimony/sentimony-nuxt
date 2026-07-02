# Sentimony Nuxt Roadmap

Оновлено: 2026-07-01.

Це робочий roadmap для поточного стану репозиторію. Історичні аудити з 2026-06-24 та 2026-06-25 зведено до виконаного/актуального, щоб файл не дублював уже закриті задачі.

## Поточний стан

- Unit tests проходять: `npm run test:unit` -> 19 files, 54 tests.
- Typecheck проходить: `npx nuxi typecheck` (з локальними warning про відсутні Supabase env vars).
- Production build проходить: `npm run build`.
- Sitemap/indexing реалізовано з локального export: `/api/__sitemap__/urls` -> 931 URL, `/sitemap.xml` містить public catalog detail pages, auth/profile routes виключені.
- Канонічний catalog export лежить у `server/data/server/sentimony-db-export.json`.
- List API вже повертають компактні DTO і фільтрують `visible`.
- Auth/likes/profile API мають private/no-store route rules; public catalog API кешуються окремо.
- Detail API фільтрують приховані записи, `v-html` проходить через `sanitizeHtml`.
- Google Fonts self-hosted (`download: true`), `@lucide/vue` прибрано, `@nuxt/icon` працює без server bundle.
- Release detail уже паралелізує основні запити і використовує `/api/release/[id]/related`.

## P0

### 1. Виправити `/tracks` data contract

`app/pages/tracks.vue` очікує `tracklistCompact` і `tracks_number` з `useReleases()`, але `server/api/releases.get.ts` повертає компактний list DTO без цих полів. Наслідок: сторінка треків може показувати порожній список/некоректну статистику, особливо після уніфікації Firebase/Supabase DTO.

Рішення:

- або додати окремий `/api/tracks`/`/api/catalog/summary` для сторінки треків;
- або явно повернути мінімальні track summary поля тільки для цього сценарію;
- покрити `tracks.vue` unit/API тестом на непорожній список і коректний count.

### 2. Додати обов'язковий CI quality gate

Unit suite і ручний `npx nuxi typecheck` зараз зелені, але в `package.json` немає окремого `typecheck` script, і немає зафіксованого CI workflow, який блокує deploy.

Рішення:

- додати `typecheck` script (`nuxt typecheck` або `vue-tsc` у проєктному форматі);
- додати CI: `npm ci`, `npm run test:unit`, `npm run typecheck`, `npm run build`, критичні E2E/API security smoke tests;
- задокументувати, що `sync:*` скрипти не запускаються в CI без явного ручного тригера.

## P1

### 3. Відокремити content DTO від like counters

Detail endpoints додають `like_count` у кешовану catalog відповідь (`catalogCacheOptions()` за замовчуванням на 1 годину). Це робить counts застарілими і зв'язує важкий content payload із динамічною метрикою.

Рішення:

- залишити detail content стабільно кешованим;
- винести counts у коротко кешовані public count endpoints або агреговані counters у БД;
- на клієнті ініціалізувати optimistic state окремо від content response.

### 4. Lazy-load сторонні плеєри

`TabsRoot` має `:unmount-on-hide="false"`, а release/track/playlist/artist pages можуть одночасно монтувати Bandcamp, YouTube/YT Music і SoundCloud iframe. Це шкодить LCP, трафіку й мобільним пристроям.

Рішення:

- змінити tabs behavior на unmount/lazy mount для неактивних вкладок;
- додати lightweight facade "load player" для важких iframe;
- перевірити, що активна вкладка не ламає deep SSR/hydration.

### 5. Зменшити client bundle навколо auth/Supabase/UI

`Header.vue`, `OpenSidebar.vue`, `AuthForm.vue`, `profile/*` та likes composables використовують Supabase client/user. Частина auth state потрапляє в глобальний layout/header, а `Toaster` монтується глобально в `app/app.vue`.

Рішення:

- винести легкий server-derived session state для header/navigation;
- lazy-load Supabase client тільки для auth/profile/like interaction;
- перевірити production build chunks після змін;
- за потреби lazy-load `vue-sonner` і важкі UI залежності.

### 6. Нормалізувати track-artist модель

`artist_slug` у tracks досі CSV-рядок, а `server/api/track/[id].get.ts` для similar tracks читає всі треки й фільтрує в пам'яті. Це працює для малого каталогу, але погано масштабується і ускладнює точні зв'язки.

Рішення:

- створити `track_artists(track_slug, artist_slug, position)`;
- додати індекси для `track_slug`, `artist_slug`, `release_slug`;
- переписати similar tracks/release tracks на індексовані запити;
- для Firebase fallback тримати індексований read path або обмежити fallback migration-only сценарієм.

## P2

### 7. Завершити profile aggregation

`/api/profile/summary` уже зводить counts, але активна collection page окремо довантажує items. Це прийнятно, проте профіль все ще можна здешевити.

Рішення:

- повернути summary + першу сторінку активної/кожної категорії одним endpoint або RPC;
- залишити пагінацію для наступних сторінок;
- зберегти private/no-store cache policy.

### 8. Обмежити production request logging

`server/middleware/request-logger.ts` логить кожен запит із IP, URL query і referrer. Для production це зайві function logs і потенційні персональні дані.

Рішення:

- вимикати verbose logs у production або семплувати;
- редагувати query/referrer перед логуванням;
- залишити повний режим тільки для локального debug.

### 9. Посилити mutations validation/rate limiting

Likes mutations зараз перевіряють переважно наявність `slug`. Немає schema validation, max length, перевірки існування сутності та rate limiting.

Рішення:

- ввести shared slug validator;
- перевіряти існування public entity перед insert;
- додати rate limiting для likes/auth mutation endpoints;
- покрити API security tests.

## Закрито з попередніх аудитів

- DB export прибрано з public path.
- Public/private API cache rules розділено.
- Hidden entities закрито через `visible` фільтри та `isPublicEntity`.
- `v-html` проходить через локальний sanitizer; `isomorphic-dompurify/jsdom` не використовується.
- Firebase/Supabase list endpoints уніфіковано через компактні DTO.
- `/api/tracks/[release_slug]` кешується і не читає весь Firebase tracks collection напряму.
- Release related дані винесено в `/api/release/[id]/related`.
- Sitemap/indexing закрито: dynamic URLs генеруються з `server/data/server/sentimony-db-export.json` через `/api/__sitemap__/urls`, `nuxt.config.ts` підключає `sitemap.sources`, auth/profile routes мають noindex route rules, public pages мають canonical.
- Like composables/API значною мірою узагальнено через `createLikes` і `server/utils/likes.ts`.
- Profile summary endpoint додано.
- Artist sorting винесено в `app/utils/artists.ts` і покрито тестами.
- TS-помилки в `server/api/track/[id].get.ts` і `server/utils/likes.ts` закрито через typed `mapReleaseFromSupabase`.
