# Sentimony Nuxt Roadmap

Оновлено: 2026-07-18.

Це робочий roadmap для поточного стану репозиторію. Історичні аудити з 2026-06-24 та 2026-06-25 зведено до виконаного/актуального, щоб файл не дублював уже закриті задачі.

## Поточний стан

- Unit tests проходять: `npm run test:unit` -> 39 files, 161 tests.
- Typecheck проходить: `npx nuxi typecheck` (з локальними warning про відсутні Supabase env vars).
- Production build проходить: `npm run build`.
- Catalog source переведено на Supabase у всіх контекстах Netlify (`NUXT_CATALOG_SOURCE=supabase`): prod + stage. `audio_url` треків синкається Supabase-only, тому Firebase був stale.
- Lighthouse mobile (чистий, 2026-07-16): Accessibility 100, Best Practices 100, SEO 98, PWA 100, Performance 68 (див. P0 #1).
- Sitemap/indexing реалізовано з локального export: `/api/__sitemap__/urls`, `/sitemap.xml` містить public catalog detail pages, auth/profile routes виключені.
- Канонічний catalog export лежить у `server/data/sentimony-db-export.json`.
- List API вже повертають компактні DTO і фільтрують `visible`.
- Auth/likes/profile API мають private/no-store route rules; public catalog API кешуються окремо.
- Detail API фільтрують приховані записи, `v-html` проходить через `sanitizeHtml`.
- Google Fonts self-hosted (`download: true`), `@lucide/vue` прибрано, `@nuxt/icon` працює без server bundle.
- Release detail уже паралелізує основні запити і використовує `/api/release/[id]/related`.

## P0

### 1. Покращити mobile Performance (Lighthouse)

Lighthouse mobile (2026-07-16, чистий репорт без deploy-preview баннера): **Performance 68**, Accessibility 100, Best Practices 100, SEO 98, PWA 100. Головні важелі — **TBT 630 ms (score 47)** і **Speed Index 7.3 s (score 29)**; TTFB у момент зняття 2.4 s (холодний старт функції, наживо стейдж ~0.4–0.6 s), CLS 0.001, LCP 2.8 s — ок.

Проблеми за впливом:

- **Main-thread / TBT** (`mainthread-work-breakdown` 6.3 s, `bootup-time` 1.7 s): забагато JS виконується на головному потоці.
- **Unused JS**: `_nuxt/*.js` великий бандл — 103 KiB невикористаних із 177 KiB (~600 ms економії).
- **Non-passive event listeners** (`uses-passive-event-listeners`, score 0): один `_nuxt/*.js` вішає non-passive scroll/touch listener (ймовірно `v-wave`/Swiper/tooltip) — блокує скрол.
- **DOM size** 1275 елементів (score 58): важка головна (Swiper-и, багато карток).
- **tap-targets 89%**: YouTube- і GitHub-лінки у футері замалі/близько.

Рішення:

- code-split великий `_nuxt` бандл; lazy hydration / `defineAsyncComponent` для важких нижньофолдних компонентів (Swiper-и) — перетинається з P1 #4/#5;
- зробити scroll/touch listeners passive (перевірити джерело у `_nuxt/*.js`);
- рознести/збільшити tap-targets у футері;
- перезняти Lighthouse на прогрітому `sentimony.com`, щоб відділити холодний старт TTFB від реальної картини.

### 3. Додати обов'язковий CI quality gate

Unit suite і ручний `npx nuxi typecheck` зараз зелені, але в `package.json` немає окремого `typecheck` script, і немає зафіксованого CI workflow, який блокує deploy.

Рішення:

- додати `typecheck` script (`nuxt typecheck` або `vue-tsc` у проєктному форматі);
- додати CI: `npm ci`, `npm run test:unit`, `npm run typecheck`, `npm run build`, критичні E2E/API security smoke tests;
- задокументувати, що `sync:*` скрипти не запускаються в CI без явного ручного тригера.

## P1

### 5. Lazy-load сторонні плеєри

`TabsRoot` має `:unmount-on-hide="false"`, а release/track/playlist/artist pages можуть одночасно монтувати Bandcamp, YouTube/YT Music і SoundCloud iframe. Це шкодить LCP, трафіку й мобільним пристроям.

Рішення:

- змінити tabs behavior на unmount/lazy mount для неактивних вкладок;
- додати lightweight facade "load player" для важких iframe;
- перевірити, що активна вкладка не ламає deep SSR/hydration.

### 6. Зменшити client bundle навколо auth/Supabase/UI

`Header.vue`, `OpenSidebar.vue`, `AuthForm.vue`, `profile/*` та likes composables використовують Supabase client/user. Частина auth state потрапляє в глобальний layout/header, а `Toaster` монтується глобально в `app/app.vue`.

Рішення:

- винести легкий server-derived session state для header/navigation;
- lazy-load Supabase client тільки для auth/profile/like interaction;
- перевірити production build chunks після змін;
- за потреби lazy-load `vue-sonner` і важкі UI залежності.

## P2

### 8. Завершити profile aggregation

`/api/profile/summary` уже зводить counts, але активна collection page окремо довантажує items. Це прийнятно, проте профіль все ще можна здешевити.

Рішення:

- повернути summary + першу сторінку активної/кожної категорії одним endpoint або RPC;
- залишити пагінацію для наступних сторінок;
- зберегти private/no-store cache policy.

### 9. Обмежити production request logging

`server/middleware/request-logger.ts` логить кожен запит із IP, URL query і referrer. Для production це зайві function logs і потенційні персональні дані.

Рішення:

- вимикати verbose logs у production або семплувати;
- редагувати query/referrer перед логуванням;
- залишити повний режим тільки для локального debug.

### 10. Посилити mutations validation/rate limiting

Likes mutations зараз перевіряють переважно наявність `slug`. Немає schema validation, max length, перевірки існування сутності та rate limiting.

Рішення:

- ввести shared slug validator;
- перевіряти існування public entity перед insert;
- додати rate limiting для likes/auth mutation endpoints;
- покрити API security tests.

## P3

### 11. Оновити PWA-іконки

Іконки PWA не подобаються на macOS: логотип впритул до країв, а хотілося б із «випираючими» елементами логотипа (без safe-area padding, maskable-варіант із виносом деталей за межі базового кола).

Рішення:

- перегенерувати icon set (`public/site.webmanifest` + PNG/maskable) так, щоб елементи логотипа виступали;
- перевірити вигляд у macOS dock/Add-to-Home та `npm run verify:pwa`.

### 12. Перевірити валідність дизайн-системи

Впевнитись, що зараз використовується консистентна, валідна дизайн-система (shadcn-vue + Tailwind v4 токени), без розсинхрону між компонентами.

Рішення:

- аудит токенів теми (`app/assets/css/tailwind.css`) і per-component hardcoded кольорів (`text-white/X` тощо) — light theme досі token-only, не поліршений покомпонентно;
- звірити з shadcn-vue примітивами й `components.json`.

### 13. README з іконками у стилі AgileCharts

Оновити README, щоб мав іконки/badges у стилі AgileCharts.

Рішення:

- додати секцію з іконками (tech stack badges / section-иконки);
- звірити стиль із референсом AgileCharts.

### 14. Синхронізувати оптимістичний play count між плеєром і рядком tracklist

На сторінці релізу колонка «Plays» у рядках tracklist читає page-level `playCounts`, а оптимістичний `+1` на клік play живе лише в дочірньому `AudioTrackPlaylist`. Тому лічильник у рядку не реагує на відтворення без перезавантаження. Це попередня поведінка (page і компонент завжди тримали окремі копії), не регресія оптимізації release tracklist.

Рішення:

- підняти джерело істини play counts на сторінку (напр. `v-model`/emit з компонента при `registerPlay`), або дати рядку читати дочірній стан;
- зберегти `Math.max`-семантику (`mergePlayCounts`), щоб не занижувати короткокешований публічний агрегат.

## Закрито з попередніх аудитів

- DB export прибрано з public path.
- Public/private API cache rules розділено.
- Hidden entities закрито через `visible` фільтри та `isPublicEntity`.
- `v-html` проходить через локальний sanitizer; `isomorphic-dompurify/jsdom` не використовується.
- Firebase/Supabase list endpoints уніфіковано через компактні DTO.
- `/api/tracks/[release_slug]` кешується і не читає весь Firebase tracks collection напряму.
- Release related дані винесено в `/api/release/[id]/related`.
- Sitemap/indexing закрито: dynamic URLs генеруються з `server/data/sentimony-db-export.json` через `/api/__sitemap__/urls`, `nuxt.config.ts` підключає `sitemap.sources`, auth/profile routes мають noindex route rules, public pages мають canonical.
- Like composables/API значною мірою узагальнено через `createLikes` і `server/utils/likes.ts`.
- Profile summary endpoint додано.
- `/tracks` data contract закрито: сторінка споживає `/api/tracks` (`fetchAllCatalogTrackRows`) з `track_number`/`bpm`/`audio_url`, а не `tracklistCompact` з `useReleases()`; контракт покрито `tests/unit/catalogTracks.test.ts`.
- Like counters відокремлено від content DTO: агрегат `like_counters` + RPC `increment_like`, batch count endpoints під `*/count/**` (60s public cache), `like_count` прибрано з кешованих catalog-відповідей.
- Track-artist модель нормалізовано: `track_artists(track_slug, artist_slug, position)` наповнюється sync:supabase з CSV; similar tracks і artist tracks у Supabase-режимі читають індекс, Firebase-режим лишився CSV fallback.
- Artist sorting винесено в `app/utils/artists.ts` і покрито тестами.
- TS-помилки в `server/api/track/[id].get.ts` і `server/utils/likes.ts` закрито через typed `mapReleaseFromSupabase`.
- A11y `link-name` (Lighthouse) закрито: `aria-label` для соц-лінків у `Footer.vue`/`Header.vue` і для `/signin` (текст `hidden lg:inline`) — Accessibility 100.
- Catalog source прод+стейдж переведено на Supabase (`NUXT_CATALOG_SOURCE`), що полагодило відсутнє аудіо (Firebase мав 15 треків з `audio_url`, Supabase — 49).
