# Profile surface

- Status: Implemented
- Priority: P1
- Ініційовано: 2026-07-26
- Last reviewed: 2026-07-27
- Related: [audit](../audits/2026-07-26-profile-pages-audit.md), [spec](../superpowers/specs/2026-07-26-profile-surface-design.md), [plan](../superpowers/plans/2026-07-26-profile-surface.md)

## Навіщо

`/profile/tracks` віддає 500 у Supabase-режимі: ендпоінт селектить `release_slug`
і `track_number`, які дропнула міграція `20260707_tracks_first_class.sql`
(перевірено проти живої бази). `usePaginatedLikes` ковтає помилку в порожній
масив, а `ProfileCollectionStatus` не має стану помилки, тому збій виглядає як
«Nothing saved here yet» — саме це й ховало баг, поки таб над сторінкою показував
реальний лічильник.

Крім того, profile — остання поверхня сайту, яка не пройшла міграцію focus і
контрасту: п'ять call-sites із `outline-none` + `focus-visible:ring-ring/50` (ті
самі, що [аудит 2026-07-25](../audits/2026-07-25-auth-theme-contrast-audit.md)
виніс у follow-up), 21 входження `text-foreground/N` нижче `muted-foreground`,
60 парних `black/N dark:white/N`, шість рукописних кнопок повз `ui/button`.

## Очікуваний результат

Колекції profile працюють, збій відрізняється від порожнечі й має дію повтору, а
вся поверхня тримає ті самі два текстові тири, outline-focus і primitives, що
auth.

## Обсяг

- `entitySelect` лайкнутих треків на канонічні колонки; розділення типів
  `Track` / `ReleaseTrack`; посилання треку на `/track/<slug>`.
- `error` + `retry` у `usePaginatedLikes` і `ProfileCollectionStatus` — закриває
  клас багів для всіх шести колекцій.
- Зняття `outline-none` / `focus-visible:ring-*`, явні transition-списки без
  `outline-color`.
- Два текстові тири, одинарні `foreground/N`, `--destructive` замість
  `red-400`, зникнення `blue-500`.
- `ui/button`, `Input`, `DefaultButton` замість рукописних контролів; таби як
  `DefaultButton`, усі шість секцій завжди видимі.
- Одна ширина (`max-w-5xl`), одна шкала радіусів, мінус зайві мікро-лейбли,
  підтвердження видалення аватара.
- Охорона: блок `profile surface` у `tests/unit/interactionStates.test.ts` плюс
  `likedTracksColumns`, `usePaginatedLikes` і `profileCollectionStatus` тести.

## Залежності

- Візуальна перевірка обох тем із залогіненим акаунтом.
- `DefaultButton`, `Input` і `buttonVariants` спільні для сайту, тому потрібен
  короткий обхід каталогу після правок.
- Не конфліктує з [profile aggregation](profile-aggregation.md): кількість
  запитів не змінюється.

## Критерії завершення

- `/profile/tracks` показує лайкнуті треки, посилання ведуть на `/track/<slug>`.
- Помилка завантаження будь-якої колекції відрізняється від порожньої і має
  `Try again`.
- `Tab` дає видиме обведення на кожному інтерактивному елементі profile у двох
  темах, без анімації кольору.
- У `PROFILE_FILES` нема `text-foreground/N`, парних `black/white`, `red-400`,
  `blue-500`, `text-[9px]`, `outline-none`.
- `npm run test:unit` і `npm run typecheck` зелені.

## Наступний крок

Стежити за стабільністю profile surface через unit/type checks і перевіряти
авторизований сценарій під час змін колекцій або Supabase-схеми.
