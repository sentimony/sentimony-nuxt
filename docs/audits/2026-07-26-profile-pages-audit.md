# Аудит сторінок `/profile`

- Дата: 2026-07-26
- Гілка: `main`
- Обсяг: layout `app/pages/profile.vue`, overview `app/pages/profile/index.vue`,
  шість підсторінок колекцій (`releases`, `tracks`, `artists`, `videos`,
  `playlists`, `events`), спільні `ProfileCollectionPage.vue`,
  `ProfileCollectionStatus.vue`, композабли `usePaginatedLikes`,
  `useProfileSummary` і серверні хендлери, від яких ці сторінки залежать.
- Спека з правками: [2026-07-26-profile-surface-design.md](../superpowers/specs/2026-07-26-profile-surface-design.md)
- Попередній аудит, який лишив цю поверхню як follow-up:
  [2026-07-25-auth-theme-contrast-audit.md](2026-07-25-auth-theme-contrast-audit.md)

## Методика

Читання джерел плюс дві перевірки проти реального стану:

1. **Схема Supabase.** Колонки таблиці `tracks` перевірено запитом до PostgREST
   з anon-ключем проекту (`GET /rest/v1/tracks?select=…&limit=1`), тобто проти
   бази, яку читає прод.
2. **Статичний інвентар класів.** Підрахунок входжень `text-foreground/N`,
   парних `black/N dark:white/N`, `focus-visible:outline-none`, радіусів і
   розмірів шрифту по кожному файлу поверхні.

Замірів контрасту в браузері **не робилося**: аудит
[2026-07-25](2026-07-25-auth-theme-contrast-audit.md) уже встановив пороги для
цієї теми (світла: чорний текст потребує альфи ≥ 0.56 для AA 4.5; темна: білий
≥ 0.46), і всі знайдені тут рівні лежать нижче цих порогів із запасом, тому
окремий вимір не змінив би висновку. Точні ratio для нових поверхонь беруться на
кроці верифікації спеки.

## Знахідки: функціональні

### 1. `/profile/tracks` віддає 500 і завжди показує порожній стан

`server/api/track-likes/tracks.get.ts:1` селектить
`slug, title, artist_name, release_slug, track_number, bpm`. Міграція
`supabase/migrations/20260707_tracks_first_class.sql:3-4` дропнула `release_slug`
і `track_number` з `tracks`. Перевірка проти живої бази:

```
GET /rest/v1/tracks?select=slug,release_slug,track_number&limit=1
{"code":"42703","message":"column tracks.release_slug does not exist"}

GET /rest/v1/tracks?select=slug,title,artist_name,bpm&limit=1
[{"slug":"unusual-cosmic-process-brain-channel-psypheric-rmx", …}]
```

Отже в Supabase-режимі (`NUXT_CATALOG_SOURCE=supabase` у всіх Netlify-контекстах
станом на 2026-07) гілка `isSupabaseCatalogSource()` у
`server/utils/likes.ts:129-132` кидає `createError({ statusCode: 500 })` на
кожен запит лайкнутих треків. Канонічний набір колонок треку —
`slug, title, artist_name, artist_slug, bpm, audio_url`
(`server/utils/catalogTracks.ts:5`).

### 2. Помилка невідрізненна від порожньої колекції

`usePaginatedLikes` (`app/composables/usePaginatedLikes.ts:20-24`) ковтає будь-яку
помилку в `{ data: [], total: total.value }` і логує в консоль.
`ProfileCollectionStatus.vue` знає рівно три стани: `loading`, `empty`,
`hasMore`. Тому 500 з пункту 1 рендериться як «Nothing saved here yet».

Одночасно лічильник у навігації рахується з іншого джерела
(`server/api/profile/summary.get.ts` → `countUserLikes('track_likes')`), яке
працює. Результат для користувача: таб «Tracks 12» і порожня сторінка під ним.
Саме цей стан приховував баг 1.

### 3. Посилання треку веде на неіснуючий маршрут

`app/pages/profile/tracks.vue:24` — `:to="'/release/' + track.release_slug"`. За
моделлю first-class треків `release_slug` не існує ні в схемі, ні в даних, тож
навіть після виправлення пункту 1 посилання дало б `/release/undefined`. У треку
є власна сторінка `/track/[slug]`.

### 4. Тип `Track` описує неіснуючі поля

`app/types/index.ts:109,112` тримають `release_slug: string` і
`track_number: number` як обов'язкові. Ці поля реально існують лише в
похідних row-типах серверної гідрації (`server/utils/releaseTracklist.ts:35,48`),
а не в каталозі треків. Через це помилка з пункту 3 не ловиться `typecheck`.

## Знахідки: дизайн-контракт проєкту

### 5. Focus-стани — регресія проти щойно закритої ініціативи

`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50` у
п'яти місцях: `profile.vue:52`, `profile/index.vue:129`, `profile/index.vue:256`,
`profile/tracks.vue:25`, `ProfileCollectionStatus.vue:32`.

Це рівно ті п'ять call-sites, які
[аудит 2026-07-25](2026-07-25-auth-theme-contrast-audit.md) виніс у follow-up.
Два наслідки:

- `AGENTS.md` (секція Text tiers and focus states) забороняє безумовний
  `outline-none` і заміну outline на `ring-*`;
- на `NuxtLink` (`profile.vue:52`, `index.vue:256`, `tracks.vue:25`)
  `outline-none` **скасовує** глобальне правило `a:focus-visible`
  (`app/assets/css/tailwind.css:107-110`), яке дає повний `--ring`, і підміняє
  його кільцем на 50% токена. Аудит 2026-07-25 виміряв `ring-ring/50` як
  1.60 (light) / 2.28 (dark) проти потрібних 3.0 — і це до того, як `--ring` було
  переретюнено; після ретюну половина токена все одно лишається неперевіреною.

### 6. Третій текстовий тир, якого в системі немає

21 входження `text-foreground/N` нижче `muted-foreground`:

| файл | входження |
|---|---|
| `app/pages/profile/index.vue` | 15 (`/20` ×2, `/25` ×2, `/30` ×6, `/35`, `/40` ×3, `/45`) |
| `app/components/ProfileCollectionStatus.vue` | 3 (`/25`, `/30`, `/35`) |
| `app/pages/profile/tracks.vue` | 2 (`/25` ×2) |
| `app/pages/profile.vue` | 1 (`/40`) |

`AGENTS.md`: тирів рівно два, `/40` і `/50` не проходять AA у світлій темі
(2.58-3.94). Тут дно опускається до `/20` (лічильники на картках секцій,
`index.vue:262,279`) і `/25` (порожній стан і підказка про формат аватара,
`index.vue:211,287`). `tests/unit/interactionStates.test.ts` уже стереже це
правило, але лише для `AUTH_FILES`; profile — найбільша немігрована поверхня
сайту.

### 7. Парні `black/white` дублікати

60 входжень утиліт виду `bg-black/3 dark:bg-white/3`,
`border-black/10 dark:border-white/10`, `hover:bg-black/5 dark:hover:bg-white/5`:
`index.vue` 48, `profile.vue` 6, `tracks.vue` 4, `ProfileCollectionStatus.vue` 2.
Auth-поверхня вже перейшла на одинарні `foreground/N`, і тест це стереже.

### 8. Кольори повз токени

- `index.vue:145` — інпут імені: `focus:border-blue-500 focus:ring-1
  focus:ring-blue-500`. Синій акцент не існує більше ніде в проєкті (порушення
  єдиного акценту), а сам інпут рукописний: `border-white/20 bg-black/20
  dark:bg-black/40` замість `ui/input`, який після ретюну має перевірений
  outline і `bg-foreground/8`.
- `index.vue:148` — текст помилки `text-red-400`, запечений під темну тему. Це та
  сама причина, через яку `interactionStates.test.ts` забороняє `text-green-400`;
  токен `--destructive` існує.

### 9. `ui/button` в обхід

Шість рукописних `<button>` із власними наборами класів: Save
(`index.vue:150-157`), Cancel (`index.vue:158-165`), Upload
(`index.vue:191-199`), Remove avatar (`index.vue:200-209`), Sign out
(`index.vue:225-232`), «Show more» (`ProfileCollectionStatus.vue:28-36`).
`AGENTS.md`: `ui/button` — єдиний авторитет стилю; варіанти `submit` і `default`
покривають усі шість.

### 10. Навігація profile дублює наявний компонент

`profile.vue:48-62` — рукописні піл-таби з іконкою, лейблом і лічильником. Це
буквально патерн `<GenreTabs>`: `<DefaultButton small outline :count>`, який уже
рендерить `· N` у `font-mono` і тримає активний стан через `exactActiveClass`
(`DefaultButton.vue:35,47`). Неактивний стан у profile — `text-foreground/40`,
тобто та сама проблема з пункту 6.

## Знахідки: композиція і UX

### 11. Em-dash як контент

`index.vue:137` — `{{ user?.user_metadata?.full_name || '—' }}`. Em-dash у
видимому тексті заборонений; порожнє ім'я має бути словом.

### 12. Перевантаження мікро-лейблами

На `/profile` одночасно: чотири лейбли карток акаунта
(`text-[9px] uppercase tracking-[0.24em]`), «Collection overview» над `<h1>`,
шість лейблів секцій (`tracking-[0.18em]`) і шість рядків-філерів «Open
collection». Сім `text-[9px]` і сім `text-[10px]` на одну сторінку.

### 13. Нечитний типографічний низ

`text-[9px]` у парі з `/25`-`/30` — підказка «JPG, PNG, WebP · max 2 MB»
(`index.vue:211`) фактично невидима навіть у темній темі. 9px не має бути в
системі взагалі; мінімальний технічний розмір на сайті — 10px.

### 14. Розсинхрон ширин

`profile.vue:42` — контейнер `max-w-[112rem]`; навігація і `/profile` —
`max-w-5xl`; `ProfileCollectionPage.vue:29` — `flex flex-wrap justify-center` на
всі 112rem. Таби центровані по одній сітці, ґрід карток під ними — по іншій.

### 15. Чотири шкали радіусів без правила

`rounded-lg` (картки, 5), `rounded-md` (кнопки, 6), `rounded` (таби, рядки
треків, «Show more», 3), `rounded-full` (аватар, іконка секції, 2).

### 16. Layout shift при редагуванні імені

Картка Name росте у висоту при вході в режим редагування (`index.vue:140-167`) і
тягне за собою весь ряд ґріда.

### 17. Навігація змінює форму під користувачем

`profile.vue:18-20` — `visibleSections` ховає секції з нулем. Якщо зняти
останній лайк, перебуваючи на сторінці цієї секції, таб зникає з-під користувача,
а сторінка лишається відкритою. `GenreTabs` показує всі таби, включно з
нульовими; патерн проєкту протилежний.

### 18. Видалення аватара без підтвердження

`index.vue:200-209` — незворотна дія в один клік, без діалогу і без undo.

## Follow-up поза обсягом правок

- Site-wide `text-foreground/50` — 43 входження поза profile; це
  [design system](../initiatives/design-system.md).
- `ThemeToggle.vue:9`, `Header.vue:130,139`, `OpenSidebar.vue:66`,
  `OpenImage.vue:89` лишаються останніми `outline-none` після цих правок і
  належать [accessibility structure](../initiatives/accessibility-structure.md).
- `usePaginatedLikes` ковтає помилки для **всіх** шести колекцій, не лише
  треків; після додавання error-стану решта п'яти отримують його безкоштовно, але
  окремих замірів їхніх ендпоінтів цей аудит не робив.
- Плеєр для лайкнутих треків (`<PagePlayer>` + наявний `audio_url`) — окрема
  продуктова зміна, не борг.
- `docs/initiatives/profile-aggregation.md` (один overview-запит замість N)
  лишається чинним і незалежним: ці правки не змінюють кількість запитів.
