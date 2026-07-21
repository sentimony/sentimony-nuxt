# Profile aggregation (PRODUCT.md §7, ROADMAP P2 #8)

Дата: 2026-07-19. Гілка: `json-to-yml`.

> Спека написана в автономному режимі (користувач заборонив питання).

## Контекст

- `/api/profile/summary` повертає лише лічильники (6 паралельних `count(*)` head-запитів через `countUserLikes`).
- Кожна колекційна сторінка (`ProfileCollectionPage.vue`) окремо тягне першу сторінку items через `usePaginatedLikes(endpoint, 25, initialTotal)` → `likedItemsHandler` (`{ data, total }`, 0-based `page`, clamp `limit` 1–100).
- `fetchLikedItems(event, opts, userIdOverride?, pagination?)` у `server/utils/likes.ts` **уже підтримує** pagination override — готовий будівельний блок для агрегованого endpoint.
- Опції 6 liked-endpoints (`table`/`slugCol`/`entityTable`/`entitySelect`/`visibleOnly`) задубльовані інлайн у 6 файлах `server/api/*likes*/…get.ts`.
- `profile/tracks.vue` — кастомна сторінка поза `ProfileCollectionPage`.

## Рішення

1. **Новий endpoint `/api/profile/overview`** (private, no-store — уже покривається route rules для `/api/profile/**`): повертає

```jsonc
{
  "counts": { "releases": 3, "tracks": 0, ... },
  "collections": {           // тільки категорії з count > 0
    "releases": { "data": [ /* перші 25 */ ], "total": 3 },
    ...
  }
}
```

Реалізація: `getUserId` → `countUserLikes` ×6 паралельно → для непорожніх категорій `fetchLikedItems(event, opts, userId, { page: 0, limit: 25 })` паралельно. `/api/profile/summary` лишається (зворотна сумісність для дрібних споживачів), але сторінки профілю переходять на overview.
2. **DRY опцій**: винести 6 наборів `LikedItemsOptions` у `server/utils/likedCollections.ts` (`LIKED_COLLECTIONS: Record<SectionKey, LikedItemsOptions>`); 6 endpoint-файлів і overview використовують спільні константи.
3. **Клієнт**: `useProfileOverview()` (`useFetch('/api/profile/overview', { key: 'profile-overview' })` — дедуплікація між layout і підсторінками). `usePaginatedLikes` отримує опційний `initialItems: T[]` — якщо переданий, перша сторінка не перезапитується (`page = 1`, `loaded = true`). `ProfileCollectionPage` приймає `initial-items` і передає в композабл.
4. **`profile/tracks.vue` не чіпаємо** (кастомний флоу; отримає дані overview пізніше окремою задачею, якщо буде потреба — YAGNI).
5. Пагінація наступних сторінок — без змін (той самий `likedItemsHandler`).

## Наслідки

- Вхід у профіль = 1 приватний запит замість 1 (summary) + 1 на кожну відвідану секцію.
- Вартість overview ≈ сума перших сторінок непорожніх категорій — прийнятно для приватного некешованого запиту (типовий користувач має 1–3 непорожні категорії).

## Тести

- Юніт на overview handler (мок `getUserId`, `countUserLikes`, `fetchLikedItems`): гість → порожні counts без collections; користувач → collections лише для непорожніх категорій; форма `{ data, total }`.
- Юніт на `usePaginatedLikes` з `initialItems` (перший `loadMore` тягне `page=1`).
- Наявні тести liked-endpoints після рефакторингу опцій — зелені.
