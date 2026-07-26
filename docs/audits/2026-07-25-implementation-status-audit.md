# Аудит стану реалізації Sentimony Nuxt

- Дата: 2026-07-25
- Гілка: `main` (worktree має незакомічені зміни в `package.json`, `package-lock.json`, `scripts/skills.sh`)
- Обсяг: перевірка всіх ініціатив `docs/roadmap` проти поточного коду; повторна
  перевірка висновків [аудиту документації від 2026-07-22](2026-07-22-documentation-status-audit.md).

## Методика

Кожна ініціатива перевірена за наявністю цільових файлів, контрактів, тестів і
конфігурації. Статуси ті самі, що й у попередньому аудиті: **Реалізовано**,
**Частково**, **Не реалізовано**, плюс **Знято з обсягу** для ініціатив, чия
передумова більше не відповідає прийнятому рішенню або архітектурі.

## Що змінилося після 2026-07-22

- `npm run typecheck` і `npm run typecheck:ts7` існують у `package.json`;
  твердження попереднього roadmap про відсутність typecheck script неактуальне.
- `.github/workflows/web-debug.yml` запускає typecheck, TS7 edge typecheck, unit
  tests, `node-server` build і HTTP smoke на push/PR.
- Unit suite: **40 files / 169 tests**, зелений (прогін 2026-07-25). Падіння
  `likeButtons.test.ts` із попереднього аудиту було знімком dirty worktree і
  закрите разом із button unification.
- Buttons уніфіковано навколо `app/components/ui/button` як єдиного джерела
  стилів; `@nuxt/image` прибрано на користь статичних `_th` варіантів і `thumb()`.
- `AudioTrackPlaylist` більше не існує: on-page плеєр і tracklist злиті в
  `app/components/player/PagePlayer.vue`.
- Swiper у `app/layouts/default.vue` підключений як `LazySwiper`.
- Сторінку `/event/[id]` переверстано за макетом release detail (двоколонковий
  hero, Tabs, `ItemContent` з Organizers/Relative Artists).

## Статус ініціатив roadmap

| Ініціатива | Пріоритет | Стан | Доказ |
| --- | --- | --- | --- |
| Catalog visibility security | P0 | Знято з обсягу | `server/api/artist/[id].get.ts` і `server/api/release/[id].get.ts` навмисно не фільтрують `visible`; `tests/unit/artistPageApi.test.ts` закріплює контракт `returns hidden artists by direct slug route`; AGENTS.md описує це як продуктове рішення. |
| Mobile performance | P0 | Не реалізовано | Свіжого Lighthouse-заміру немає. `LazySwiper` знижує initial JS, але DOM cap, lazy hydration і tap targets футера не змінені. |
| CI quality gate | P0 | Частково | `web-debug.yml` покриває typecheck/unit/build/HTTP smoke; Playwright job, Netlify-preset build і задокументовані required checks відсутні. |
| TypeScript hardening | P1 | Частково | `typecheck` і `typecheck:ts7` існують і виконуються в CI; `tsconfig.tests.json`, `typecheck:tests`, unused/strictness flags і ESLint guardrails — ні. |
| Component testing and coverage | P1 | Не реалізовано | Немає DOM-проєкту Vitest, coverage provider і thresholds; source-string assertions лишаються основним component contract. |
| E2E reliability | P1 | Не реалізовано | Playwright не запускається в CI; first-paint race і прогалини route smoke відкриті. |
| Auth bundle | P1 | Не реалізовано | Заплановані lazy auth/header/toaster boundaries відсутні. |
| API list envelope | P1 | Не реалізовано | `buildListEnvelope` відсутній; list endpoints зберігають попередні response shapes. |
| Profile aggregation | P2 | Не реалізовано | `server/api/profile/` містить лише `summary.get.ts`; немає `/api/profile/overview` чи `useProfileOverview`. |
| Production request logging | P2 | Не реалізовано (ризик підтверджено) | `server/middleware/request-logger.ts` викликає `logRequest()` з `server/utils/logger.ts`, який логує IP, повний path із query і referrer без sampling чи redaction. |
| Mutation hardening | P2 | Не реалізовано | Немає shared slug validation, existence checks або rate limiting для likes/plays. |
| Accessibility structure | P2 | Не реалізовано | `app/layouts/default.vue` не має `<main>`; `app/pages/index.vue` не має `<h1>`. |
| PWA icons | P3 | Частково | `public/site.webmanifest` має regular і maskable 192/512, `scripts/verify-pwa.mjs` перевіряє наявність maskable; master SVG, generation script і dimension checks відсутні. |
| Design system | P3 | Не реалізовано | Немає token migration чи `designTokens` regression test; часткове зближення дало лише `ui/button` як єдина стильова інстанція кнопок. |
| README branding | P3 | Частково | README має Netlify badge і per-tech icons; compact badge row і section icons — ні. |
| Play-count synchronization | P3 | Знято з обсягу | `AudioTrackPlaylist` замінено на `PagePlayer`, який тримає єдиний `playCounts` ref для контролів і рядків tracklist, мержить server counts через `mergePlayCounts` і реєструє play на `playToken`. Розділених копій state більше немає. |
| Release artist/title split | P3 | Не реалізовано | `app/utils/releaseTitle.ts` відсутній. `splitTitleByArtists` у `app/utils/tracks.ts` покриває суміжну задачу — лінкування артистів усередині рядків треків і event lineup. |
| Site search | P3 | Не реалізовано | Search endpoint, composable і dialog відсутні. |
| Future ideas | — | Не реалізовано | Cloudflare migration, Sentry, Sentimony-owned UI, custom swiper, audio waveform, Bandcamp-code gifts лишаються на стадії ідеї. |

Підсумок: **0 реалізовано, 4 частково, 12 не реалізовано, 2 знято з обсягу**.

## Знято з обсягу — обґрунтування

**Catalog visibility security.** WEB-1/VITEST-1 трактували повернення hidden
artist як дефект. Поточна архітектура робить це навмисно: `/artists/all` і
`/releases/all` публічно перелічують усі записи, включно з `visible: false`, а
detail endpoints артиста й релізу відкривають їх за прямим URL. Публічними
межами лишаються list endpoints (`/api/artists`, `/api/releases`, `/api/events`)
і sitemap — `server/utils/sitemapUrls.ts` фільтрує `visible === true`. Тобто
`visible` є прапорцем «не показувати в каталозі й пошуку», а не access control.
Якщо потрібен саме access control, це має бути нова ініціатива з іншою назвою
та власним contract, а не продовження цієї.

**Play-count synchronization.** Причина ініціативи — два джерела правди між
release page і `AudioTrackPlaylist`. Компонент видалено; `PagePlayer` рендерить
і контроли, і рядки з одного `playCounts`, тому оптимістичний `+1` одразу видно
в рядку, а `mergePlayCounts` зберігає `Math.max` семантику проти
короткокешованої server-відповіді.

## Незакриті знахідки аудиту 2026-07-19

Без змін лишаються TS-1…TS-5, VITEST-2…VITEST-6, WEB-3, WEB-4, WEB-5, WEB-6.
Частково зрушив лише TS-1 у частині наявності `typecheck` scripts у CI —
окремий test typecheck contour усе ще відсутній.

## Висновок

Головні відкриті напрями не змінилися: mobile performance, повний CI quality
gate (Playwright + Netlify preset) і privacy-safe production logging. Два P0/P3
пункти закриті не реалізацією, а рішенням і рефакторингом, тому roadmap треба
читати як три категорії роботи: вимірювані performance-цілі, CI/test depth і
server hardening.
