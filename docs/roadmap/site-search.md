# Site search

- Status: Planned
- Priority: P3
- Last reviewed: 2026-07-22
- Related: [spec](../superpowers/specs/2026-07-21-site-search-design.md), [plan](../superpowers/plans/2026-07-21-site-search.md)

## Навіщо

Каталог має сотні артистів, релізів і треків, але користувач може знаходити їх
лише через окремі списки та browser navigation.

## Очікуваний результат

Доступна ⌘K palette шукає по шести catalog entities через компактний cached index
і локальну diacritics-normalized substring filtering.

## Обсяг

- Додати `/api/search-index` для активного catalog source.
- Додати pure filter utility та lazy `useSearch` composable.
- Створити accessible dialog/listbox і header trigger.
- Кешувати лише public lightweight index.

## Залежності

- Стабільні list fields для обох catalog backends.
- Keyboard/focus behavior потребує browser verification.

## Критерії завершення

- Пошук відкривається кнопкою та ⌘K/Ctrl+K.
- Результати охоплюють release, artist, track, video, event і playlist.
- Keyboard navigation, focus return і empty/error states працюють.
- Endpoint кешується за catalog source.

## Наступний крок

Почати з pure search filter і lightweight index builder із готового plan.
