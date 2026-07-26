# Profile surface: broken track collection, focus states and text tiers

Дата: 2026-07-26. Гілка: `main`. Roadmap: [profile-surface.md](../../initiatives/profile-surface.md) (P1).
Аудит зі знахідками: [2026-07-26-profile-pages-audit.md](../../audits/2026-07-26-profile-pages-audit.md).

## Контекст

Аудит `/profile` знайшов три класи проблем, які вигідно правити одним заходом,
бо вони перетинаються в тих самих чотирьох файлах.

**1. Продовий баг, замаскований порожнім станом.** `/api/track-likes/tracks`
селектить `release_slug, track_number` з таблиці `tracks`, а міграція
`20260707_tracks_first_class.sql` ці колонки дропнула. Перевірено проти живої
бази: `column tracks.release_slug does not exist`. Хендлер кидає 500,
`usePaginatedLikes` ковтає помилку в порожній масив, `ProfileCollectionStatus`
не має стану помилки — і сторінка малює «Nothing saved here yet», поки таб над
нею показує реальний лічильник із `track_likes`. Тобто ~рік роботи фічі
приховувався тим, що збій і порожнеча виглядають однаково.

**2. Profile — остання поверхня, яка не пройшла міграцію focus/контрасту.**
[Аудит 2026-07-25](../../audits/2026-07-25-auth-theme-contrast-audit.md) виніс
рівно ці п'ять call-sites у follow-up: `profile.vue:52`, `profile/index.vue:129`,
`profile/index.vue:256`, `profile/tracks.vue:25`,
`ProfileCollectionStatus.vue:32`. Усі п'ять поєднують безумовний `outline-none`
із `focus-visible:ring-ring/50`. На трьох із них ціль — `NuxtLink`, тому
`outline-none` скасовує глобальне `a:focus-visible` і замінює повний `--ring`
половиною токена (виміряно 1.60 light / 2.28 dark проти потрібних 3.0).

**3. Дизайн-контракт не застосований.** 21 входження `text-foreground/N` нижче
`muted-foreground` (дно — `/20` і `/25`), 60 парних `black/N dark:white/N`,
синій `blue-500` як акцент інпута, `text-red-400` замість `--destructive`, шість
рукописних кнопок повз `ui/button`, рукописна копія `<GenreTabs>`.

Ключове спостереження, яке визначає порядок робіт: **пункт 2 і 3 живуть у тих
самих чотирьох файлах** (`profile.vue`, `profile/index.vue`, `profile/tracks.vue`,
`ProfileCollectionStatus.vue`), тому розводити їх на два заходи означає двічі
переписати ті самі рядки. Пункт 1 натомість повністю серверний і не перетинається
ні з чим — він іде першим і окремо, щоб продовий фікс не чекав на косметику.

## Рішення

### 1. Каталог треків у лайках

`server/api/track-likes/tracks.get.ts` переходить на канонічний набір колонок
треку, той самий, що вже використовує `server/utils/catalogTracks.ts:5`:

```ts
entitySelect: 'slug, title, artist_name, artist_slug, bpm, audio_url'
```

Firebase-гілка (`fetchAllFirebaseTracks`) віддає надлишкові поля і від цієї зміни
не залежить; `entitySelect` читається лише в Supabase-гілці
(`server/utils/likes.ts:129`).

Щоб клас помилки більше не проходив повз `typecheck`, `app/types/index.ts`
розділяє два поняття, дзеркалячи серверний `ReleaseTrackRow`
(`server/utils/releaseTracklist.ts:33-36`):

```ts
export interface Track {
  slug: string
  title: string
  artist_slug: string
  artist_name: string
  bpm: number | null
  audio_url?: string | null
}

export interface ReleaseTrack extends Track {
  release_slug: string
  track_number: number
}
```

`TrackResponse.track`, `.releaseTracks`, `.similarTracks` стають `ReleaseTrack`,
бо `/api/track/[id]` віддає саме гідровані рядки. Локальні типи в
`playlist/[id].vue`, `tracks.vue`, `artist/[id].vue` уже оголошують ці поля самі й
не зачіпаються. Фінальний список правок визначає `npm run typecheck`.

`app/pages/profile/tracks.vue` перестає посилатися на релізи: `:to` стає
`/track/${track.slug}`. Це також єдиний коректний таргет за моделлю first-class
треків, де один трек може лежати на кількох релізах.

### 2. Помилка як окремий стан

`usePaginatedLikes` перестає видавати збій за порожнечу. Композабл додає
`error: Ref<boolean>`, виставляє його в `catch`, лишає `loaded` як є і повертає
`retry`. Текст помилки користувачу не показується (це серверний
`statusMessage`), показується дія.

`ProfileCollectionStatus` отримує четвертий стан між `loading` і `empty`:
повідомлення «Could not load this collection» плюс кнопка `Try again`, яка
емітить `retry`. `role="alert"` на контейнері, щоб скрінрідер отримав зміну.

Порядок гілок у шаблоні: `loading` → `error` → `empty` → `hasMore`. Без цього
порядку помилка з непорожнім `total` показала б і повідомлення, і «Show more».

Це закриває клас багів для всіх шести колекцій, а не лише для треків.

### 3. Focus-стани

П'ять call-sites прибирають `focus-visible:outline-none
focus-visible:ring-2 focus-visible:ring-ring/50`. Далі два різні шляхи:

- **посилання** (`profile.vue` таби, картки секцій в `index.vue`, рядки треків) —
  не отримують нічого замість. Глобальне `a:focus-visible`
  (`tailwind.css:107-110`) уже дає `outline: 2px solid var(--ring)` з
  `outline-offset: 2px`; локальні класи були єдиною причиною, чому воно не
  працювало;
- **кнопки** — переходять на `ui/button`, база `buttonVariants` уже містить
  `focus-visible:outline-solid outline-2 outline-offset-2 outline-ring`.

**Пастка Tailwind v4, яку треба закрити разом із цим:** `transition-colors`
включає `outline-color`, тому обведення інтерполюється від `currentColor` до
`--ring` протягом 300ms. Це вже виправляли у `Footer.vue`. Усі елементи
profile, які поєднують `transition-colors` із focus-обведенням, переходять на
явний список без `outline-color` (`transition-[color,background-color]`,
`transition-[color,background-color,border-color]`). Приймальна перевірка —
колір обведення однаковий одразу після `Tab` і після завершення переходу.

### 4. Текстові тири і токени

Тирів рівно два. Мапа для profile:

| зараз | стає |
|---|---|
| `text-foreground/70`, `/85` (значення, заголовки) | `text-foreground` |
| `/45`, `/40`, `/35`, `/30`, `/25`, `/20` (лейбли, лічильники, підказки, порожні стани) | `text-muted-foreground` |
| `text-red-400` | `text-destructive` |
| `focus:border-blue-500 focus:ring-blue-500` | зникає разом із рукописним інпутом |

Парні `black/N dark:white/N` (60 входжень) → одинарні `foreground/N`:
`bg-black/3 dark:bg-white/3` → `bg-foreground/3`,
`border-black/10 dark:border-white/10` → `border-foreground/10`,
`hover:bg-black/5 dark:hover:bg-white/5` → `hover:bg-foreground/5`. Це та сама
операція, яку вже пройшла auth-поверхня.

`text-[9px]` прибирається як розмір: сім входжень стають `text-[10px]`, який уже
є найменшим технічним розміром сайту. У парі з підйомом до `muted-foreground`
це і є фікс нечитних підписів.

### 5. Primitives замість рукописних контролів

| зараз | стає |
|---|---|
| інпут імені (`index.vue:141-147`) | `<Input>` + `aria-describedby` на текст помилки з `role="alert"`, як в `AuthForm.vue` |
| Save | `<Button variant="submit">` |
| Cancel, Edit (олівець), Remove avatar | `<Button variant="default" class="w-9 px-0">` |
| Upload, Sign out | `<Button variant="default">` |
| «Show more» | `<Button variant="default">` |
| таби навігації (`profile.vue:48-62`) | `<DefaultButton small outline :count :iconify>` |

Нових варіантів у `buttonVariants` **не додається**. Іконкові кнопки
описуються `class="w-9 px-0"` на call-site: варіанти не володіють лейаутом (те
саме рішення, що з `w-full` на сабмітах auth), а новий `size`-вимір у cva зачепив
би всі кнопки сайту заради трьох call-sites. Деструктивний hover на Remove
avatar виражається токеном:
`hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30`.

Таби переходять на `DefaultButton`, бо `<GenreTabs>` — це вже той самий
компонент із тією ж семантикою (лейбл + лічильник + активний таб). `DefaultButton`
рендерить `· N` у `font-mono` і тримає активний стан через `exactActiveClass`,
тобто `isSectionActive()` у `profile.vue` зникає разом із рукописною розміткою.

**Свідоме рішення: усі шість секцій завжди у навігації.** Зараз
`visibleSections` ховає секції з нулем, тому таб зникає з-під користувача, коли
той знімає останній лайк, перебуваючи на сторінці секції. `GenreTabs` показує
всі таби, включно з нульовими, — patterns сайту протилежний поточному. Стабільна
навігація також знімає стрибок лейауту після кожного лайка.

### 6. Композиція

- **Одна ширина.** Уся поверхня profile переходить на `max-w-5xl`, включно з
  ґрідами колекцій. Зараз таби й overview центровані на 5xl, а ґрід під ними
  розтягнутий на 112rem, тому таби висять без опори. Каталожна ширина тут не
  потрібна: `<Item>` має 160px у максимумі, особиста колекція — десятки, не сотні
  позицій, і 5xl дає ~9 карток у ряд. Це не змінює `/releases/all` та інші
  каталожні сторінки.
- **Одна шкала радіусів.** `rounded-lg` — картки й контейнери; `rounded-md` —
  контроли (приходить із `buttonVariants` та `Input`); `rounded-full` — аватар і
  кружок іконки секції. Голий `rounded` зникає (3 входження).
- **Мінус мікро-лейбли.** Прибираються eyebrow «Collection overview» над `<h1>`
  і шість рядків-філерів «Open collection» на картках секцій — стрілка вже
  комунікує перехід. Лейбли карток акаунта (Name/Email/Avatar/Account)
  лишаються: вони називають поле, а не декорують секцію.
- **Em-dash зникає.** `full_name || '—'` → `full_name || 'Not set'`.
- **Без стрибка при редагуванні імені.** Картка Name отримує `min-h`, що дорівнює
  висоті режиму редагування, тому ряд ґріда не переверстується на кліку.

### 7. Підтвердження видалення аватара

Кнопка Remove перемикає локальний `confirmingDelete` і на другому кроці показує
`Remove?` / `Cancel`. Без діалогу і без нової залежності; `Escape` скидає стан.
Причина: дія незворотна (файл видаляється зі Storage), а поточний UI виконує її
одним кліком по іконці.

### 8. Верифікація

Розширення `tests/unit/interactionStates.test.ts` — новий блок `profile surface`
зі списком `PROFILE_FILES` (`app/pages/profile.vue`, `app/pages/profile/index.vue`,
`app/pages/profile/tracks.vue`, `app/components/ProfileCollectionPage.vue`,
`app/components/ProfileCollectionStatus.vue`), дзеркально до наявного
`AUTH_FILES`:

- жодного `text-foreground/\d+` (обидва легальні тири не мають альфи);
- жодних парних `black/N dark:white/N` (той самий регекс, що для auth);
- жодного `focus-visible:outline-none` і `focus-visible:ring-`;
- жодного `text-[9px]`;
- `red-400` / `blue-500` відсутні.

Окремо, поза списком файлів:

- `server/api/track-likes/tracks.get.ts` містить `artist_slug` і `audio_url` та
  не містить `release_slug` / `track_number`;
- `usePaginatedLikes` на відмову `$fetch` виставляє `error` і не виставляє
  порожній успішний стан. Тест іде за референсним патерном мокання
  auto-imports через `globalThis` + `vi.resetModules()` з
  `tests/unit/likeCountersHandler.test.ts`.

Ручна верифікація на dev-сервері **порту 3100** (порти 3000-3002 належать
користувачу), обидві теми, з реальним залогіненим акаунтом:

- `/profile/tracks` показує лайкнуті треки, кожен веде на `/track/<slug>`;
- штучний збій ендпоінта (тимчасово зламаний select) дає стан помилки з `Try
  again`, а не «Nothing saved here yet»;
- прохід `Tab` по `/profile` і одній сторінці колекції: обведення видно на
  кожному табі, картці секції, кнопці і рядку треку; колір однаковий одразу після
  `Tab` і після 300ms;
- 390px: таби переносяться, картки акаунта в одну колонку, ґрід колекції не
  ріже картки.

## Поза скоупом

- Site-wide `text-foreground/50` (43 входження поза profile) —
  [design system](../../initiatives/design-system.md).
- Останні `outline-none` у `ThemeToggle.vue`, `Header.vue`, `OpenSidebar.vue`,
  `OpenImage.vue` — [accessibility structure](../../initiatives/accessibility-structure.md).
- Один overview-запит замість шести — [profile aggregation](../../initiatives/profile-aggregation.md);
  ці правки не змінюють кількість запитів.
- `<PagePlayer>` для лайкнутих треків: `audio_url` після фікса стає доступним на
  сторінці, але програвання колекції — продуктова фіча, не борг.
- `size`-вимір у `buttonVariants` і `variant="soft"` із `text-foreground/40`.
- Редизайн overview як такий: ґріди 4 і 6 колонок лишаються, змінюються лише
  ширина, радіуси, тири і зайві підписи.

## Критерії успіху

- `/profile/tracks` показує лайкнуті треки в Supabase-режимі; посилання ведуть на
  `/track/<slug>`.
- Помилка завантаження будь-якої з шести колекцій відрізняється від порожньої
  колекції та має дію повтору.
- `Tab` дає видиме обведення на кожному інтерактивному елементі всіх сторінок
  profile у двох темах, без анімації кольору.
- У `PROFILE_FILES` нема `text-foreground/N`, парних `black/white`, `red-400`,
  `blue-500`, `text-[9px]`, `outline-none`.
- Кожен контрол — це `ui/button`, `Input` або `DefaultButton`.
- `npm run test:unit` і `npm run typecheck` зелені; нові асерти падають, якщо
  повернути будь-яку зі знятих проблем.
