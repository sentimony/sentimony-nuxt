# Frontend Semantics Implementation Plan

> **For agentic workers:** Use subagent-driven-development or executing-plans to execute the plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Read-шар каталогу отримує списочну семантику, чисті доступні імена, стани для кожного списку, розміри зображень, `color-scheme`, токени замість хардкоду і контраст без накладеної прозорості — без зміни композиції; кожна правка закріплена юніт-тестом по джерелу.

**Architecture:** Правки локальні в `app/pages`, `app/components`, `app/assets/css/tailwind.css`, `nuxt.config.ts`. Нові інваріанти йдуть у наявні source-reading тести (`accessibleNames`, `interactionStates`, `landmarks`) або в новий `catalogSemantics.test.ts`. Снапшоти e2e оновлюються лише за протоколом спеки (п. 5).

**Tech Stack:** Nuxt 4.5, Vue 3, Tailwind v4 (`@theme`), Vitest, Playwright (один прогін наприкінці).

**Спека:** [`docs/specs/2026-09-04-frontend-semantics-design.md`](../specs/2026-09-04-frontend-semantics-design.md)
**Аудит:** [`docs/audits/2026-09-04-frontend-crafting-audit.md`](../audits/2026-09-04-frontend-crafting-audit.md)
**Ініціатива:** [`docs/initiatives/catalog-semantics.md`](../initiatives/catalog-semantics.md)

## Global Constraints

- Ті самі, що в плані TypeScript; гейт після кожної задачі:
  `npm run test:unit && npm run typecheck && npm run typecheck:tests && npm run docs:check`.
- Не міняти композицію, розміри, кольори (крім явно зазначених контрастних правок).
- Не запускати `test:e2e` між задачами — один прогін у задачі 12. Playwright сам піднімає dev на порту 3100; зупиняти лише цей інстанс.
- Клас-рядки не переносити з `<p>` частково: всі класи `<p>` переходять на `<li>` цілком плюс `mb-2`.

## Контекст для виконавця

- Виконується після планів TypeScript і Vitest; `typecheck:tests` уже є в гейті.
- Робоче дерево брудне навмисно (`package.json`, `package-lock.json`, `public/_redirects`, `server/data/sentimony-db.yml`, `.nuxtrc`) — не стейджити.
- Глобальне `p { @apply mb-2 }` у `tailwind.css` — джерело ритму, який `<li class="mb-2">` відтворює.
- `.Content svg path { fill }` у `tailwind.css` уже перебиває fill `SvgTriangle` — обидва місця переходять на токен.

---

## Задача 0. Precondition

- [x] Документи сесії закомічені (задача 0 плану TypeScript).

---

## Задача 1. Списки замість `<p>` (T12)

**Files:** `app/pages/release/[id].vue`, `app/pages/track/[id].vue`, `app/pages/artist/[id].vue`, `app/pages/event/[id].vue`, `app/pages/tracks.vue`, `app/pages/playlist/[id].vue`, `app/components/player/PagePlayer.vue`; test `tests/unit/catalogSemantics.test.ts` (create)

- [x] **Step 1:** тест: для кожного з семи файлів — жоден `v-for` не стоїть на `<p`; треклісти/лайнапи/списки зв'язків рендеряться як `<ol`/`<ul` з `<li`; у `playlist/[id].vue` немає `<ol>` → `<div>` → `<li>` (перевірка: після `<ol` перший дочірній тег — `<li`).
- [x] **Step 2:** `release/[id].vue` — два треклісти і два списки зв'язків → `<ol class="list-none">` / `<ul class="list-none">` + `<li class="mb-2 …">`.
- [x] **Step 3:** `track/[id].vue`, `artist/[id].vue`, `event/[id].vue`, `tracks.vue` — те саме.
- [x] **Step 4:** `playlist/[id].vue` — реліз стає `<li>` з вкладеним `<ol>` треків.
- [x] **Step 5:** `PagePlayer.vue` — рядки треків → `<ol>` + `<li>`; класи рядка на `<li>`.
- [x] **Step 6:** гейт; commit `fix(a11y): render tracklists and related links as lists`.

---

## Задача 2. Декоративний alt у посиланнях (T13)

**Files:** `app/components/Item.vue`, `app/components/RelativeItem.vue`, `app/pages/news.vue`, `app/components/Header.vue`, `app/components/buttons/PrimaryButton.vue`, `app/components/buttons/DefaultButton.vue`; test `tests/unit/accessibleNames.test.ts`

- [x] **Step 1:** тест: у шести файлах немає `:alt="` з `' Thumbnail'` / `' icon'` / `+ ' Icon'`; `<img` усередині цих компонентів має `alt=""`.
- [x] **Step 2:** правки: `alt=""` на зображеннях у посиланнях із текстом; кнопки — `alt=""`, назва в `title`/тексті.
- [x] **Step 3:** гейт; commit `fix(a11y): mark images inside labelled links as decorative`.

---

## Задача 3. Назви iframe-ів (T14)

**Files:** `app/pages/release/[id].vue`, `app/pages/artist/[id].vue`, `app/pages/video/[id].vue`, `app/pages/playlist/[id].vue`; test `catalogSemantics.test.ts`

- [x] **Step 1:** тест: кожен `<iframe` у `app/pages/**` має `title` або `:title`; жодне `:title` не конкатенує без пробілу (`+ 'YouTube`).
- [x] **Step 2:** пробіл у шести YouTube-назвах; `title="SoundCloud player"` на iframe артиста; «Iframe» → «player».
- [x] **Step 3:** гейт; commit `fix(a11y): give every embedded player a title`.

---

## Задача 4. Стани на трьох списках (T16)

**Files:** `app/pages/tracks.vue`, `app/pages/releases/all.vue`, `app/pages/artists/all.vue`; test `tests/unit/landmarks.test.ts` (або де живе перевірка `CollectionStatus`)

- [x] **Step 1:** розширити наявну перевірку `CollectionStatus` трьома сторінками.
- [x] **Step 2:** деструктуризувати `status`, `error`, `refresh` і вставити `<CollectionStatus>` за зразком `releases.vue`.
- [x] **Step 3:** гейт; commit `fix(ui): show loading, empty and error states on the remaining lists`.

---

## Задача 5. Розміри зображень (T17)

**Files:** `app/components/OpenImage.vue`, `app/components/RelativeItem.vue`, `app/pages/artist/[id].vue`, `app/pages/friend/[id].vue`; test `catalogSemantics.test.ts`

- [x] **Step 1:** тест: кожен `<img` у чотирьох файлах має `height`/`:height`.
- [x] **Step 2:** значення зі спеки (`OpenImage` 190/158, `RelativeItem` 24, портфоліо/друг 120×120).
- [x] **Step 3:** гейт; commit `fix(perf): declare image dimensions on catalog media`.

---

## Задача 6. Повзунок міксу (T19)

**Files:** `app/components/AudioMixPlayer.vue`; test `accessibleNames.test.ts`

- [x] **Step 1:** тест: `input type="range"` у `AudioMixPlayer` має `aria-label` і клас `player-range`.
- [x] **Step 2:** `aria-label="Seek"`, `class="player-range"`, `:style="{ '--progress': … }"` як у `PlayerSeek`; прибрати `accent-[#…]`.
- [x] **Step 3:** гейт; commit `fix(a11y): name the mix seek slider and reuse the player range style`.

---

## Задача 7. `color-scheme` (T15)

**Files:** `nuxt.config.ts`, `app/assets/css/tailwind.css`; test `interactionStates.test.ts`

- [x] **Step 1:** тест: `nuxt.config.ts` містить `color-scheme` meta; `tailwind.css` — `color-scheme: light` у `:root` і `color-scheme: dark` у `.dark`.
- [x] **Step 2:** правки.
- [x] **Step 3:** гейт; commit `fix(ui): declare color-scheme for both themes`.

---

## Задача 8. Токени «мох» і спільні градієнти (T18)

**Files:** `app/assets/css/tailwind.css`, `app/components/SvgTriangle.vue`, `app/components/Testimonials.vue`, `app/components/HomepageAtmosphere.vue`; test `interactionStates.test.ts`

- [x] **Step 1:** тест: `@theme` містить `--color-moss` і `--color-moss-dark`; `#b5ccb5`/`#2a4030` не зустрічаються поза `@theme`; `HomepageAtmosphere` не містить `linear-gradient(` з літеральними кольорами.
- [x] **Step 2:** токени + `--forest-tint-light/dark`; `bg-moss`/`fill-moss`/`dark:bg-moss-dark`; `html::after` і `.homepage-atmosphere::after` через змінні.
- [x] **Step 3:** гейт; commit `refactor(css): move moss colors and forest tints into theme tokens`.

---

## Задача 9. Одна карта висот iframe-ів (T22)

**Files:** `app/assets/css/tailwind.css`, `app/pages/release/[id].vue`, `app/pages/track/[id].vue`; test `catalogSemantics.test.ts`

- [x] **Step 1:** тест: у двох сторінках немає `<style`; `tailwind.css` містить `.BandcampIframe` і `.SoundcloudIframe` з `tracks-22`.
- [x] **Step 2:** злити карти (надмножина), видалити `<style>` блоки.
- [x] **Step 3:** гейт; commit `refactor(css): share the embedded player height map`.

---

## Задача 10. Копірайт і структура (V8, V9, V11)

**Files:** `app/pages/release/[id].vue`, `app/pages/event/[id].vue`, `app/pages/video/[id].vue`, `app/pages/playlist/[id].vue`, `app/components/player/PagePlayer.vue`, `app/components/OpenImage.vue`, `app/components/Hero.vue`, `app/pages/artist/[id].vue`; test `catalogSemantics.test.ts`, `landmarks.test.ts`

- [x] **Step 1:** тест: немає `Relative Releases`/`Relative Artists`, немає кириличної `Сredits`; `Hero.vue` має один `<h1` і він містить `Psychedelic Music Label`; `artist/[id].vue` рендерить секцію релізів під `v-if` з довжиною.
- [x] **Step 2:** «Related …» ×3, `Credits`, `Coming soon` ×3.
- [x] **Step 3:** `Hero.vue` — `<h1>` як обгортка обох рядків, внутрішні `span class="block"`.
- [x] **Step 4:** `artist/[id].vue` — `artistReleases` computed, секція під `v-if="artistReleases.length"`.
- [x] **Step 5:** гейт; commit `fix(ui): correct catalog copy, hero heading and empty artist sections`.

---

## Задача 11. Контраст без третього тиру (V7, T20, T21)

**Files:** `app/components/buttons/LikeButton.vue`, `app/components/player/PagePlayer.vue`, `app/components/Header.vue`, `app/components/Footer.vue`, `app/pages/artists/all.vue`; test `interactionStates.test.ts`

- [x] **Step 1:** тест: у `LikeButton`, `PagePlayer`, `Header` рядки з `{{` не містять `opacity-50`/`opacity-60`/`opacity-[0.4]`; `Footer` без `text-white/50`; `artists/all.vue` без `hover:text-white/80`.
- [x] **Step 2:** правки за спекою п. 5.
- [x] **Step 3:** гейт; commit `fix(a11y): drop stacked opacity from text and lift footer contrast`.

---

## Задача 12. E2E, AGENTS.md, ініціатива

**Files:** `tests/e2e/__screenshots__/**` (тільки за протоколом), `AGENTS.md`, `docs/initiatives/catalog-semantics.md`, `docs/roadmap.md`, `docs/completed.md`

- [x] **Step 1:** `npm run test:e2e` один раз. Якщо снапшоти падають — відкрити diff-зображення; оновлювати (`test:e2e:update`) лише якщо змінені області — підпис хедера й текст футера. Інший diff — знайти задачу, що зрушила пікселі, і виправити.
  _2026-09-05: еталон застарів наступного дня після зняття (`44efa83`: uppercase-навігація, інші іконки хедера) плюс Chromium 1228 → 1234; зсуву макета немає, еталони перезнято без DevTools, `test:e2e` зелений._
- [x] **Step 2:** AGENTS.md — нові інваріанти (треклісти `<ol>`, `alt=""` у посиланнях із текстом, без `opacity-*` на тексті в напівпрозорому батьку, `--color-moss`, `title` на кожному iframe); `Last reviewed: 2026-09-04`; під 250 рядків.
- [x] **Step 3:** ініціатива → `Implemented`, roadmap синхронно, запис у `docs/completed.md`.
- [x] **Step 4:** `npm run docs:check`; commit `docs: record the catalog semantics invariants and close the initiative`.
