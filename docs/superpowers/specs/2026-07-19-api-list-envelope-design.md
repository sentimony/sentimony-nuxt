# Рефакторинг list API: envelope `{ info, results }`

Дата: 2026-07-19. Гілка: `json-to-yml`.

> Спека написана в автономному режимі (користувач заборонив питання). Референс формату — https://rickandmortyapi.com/api/character.

## Контекст

Сім dual-source list-ендпоінтів (`/api/releases`, `/api/artists`, `/api/artists-all`, `/api/videos`, `/api/events`, `/api/playlists`, `/api/friends`) повертають **різну форму залежно від бекенду**: Firebase-режим — `Record<slug, T>` (через `pickListFields`), Supabase — `T[]`. `/api/tracks` — завжди масив. Клієнт згладжує розбіжність через `toArray()` у ~25 місцях; аргумент `key` у `toArray(raw, 'releases')` зараз ніколи не матчиться (API не повертає wrapper-ключа) — мертвий параметр.

Пагінації на публічних list-ендпоінтах немає (повна колекція за раз; releases 102, artists 242, tracks ~770). Приватні liked-items уже мають envelope `{ data, total }` + `page`/`limit` (`server/utils/likes.ts`).

Типи `XxxResponse` у `app/types/index.ts` декларують wrapper (`{ releases: Record | [] }`), якого API насправді не повертає — типи брешуть.

Sitemap читає локальний export (не API), RSS немає, e2e перевіряють лише статуси/заголовки — не зачеплені. `scripts/web-debug.mjs` ітерує 6 list-ендпоінтів — зачеплений.

## Цільовий контракт

Усі 8 публічних list-ендпоінтів (7 dual-source + `/api/tracks`) повертають єдину форму в обох режимах:

```jsonc
{
  "info": {
    "count": 102,      // загальна к-ть після visible-фільтра
    "pages": 1,        // ceil(count / limit); 1, коли limit не задано
    "next": null,      // "/api/releases?page=2&limit=20" або null
    "prev": null       // відносний URL або null
  },
  "results": [ /* T[] — той самий DTO, що зараз */ ]
}
```

Рішення:

1. **Масив — єдина форма `results`** в обох режимах: Firebase-гілка проганяє `Object.values()` після `pickListFields` (DTO-поля незмінні; сортування Firebase-гілки — як повертає RTDB, без нових гарантій; Supabase-гілка зберігає поточний server-side `order`).
2. **Пагінація опційна**: без `page`/`limit` ендпоінт повертає всю колекцію (`pages: 1`, `next/prev: null`) — поточні споживачі сайту роблять один запит і не деградують. Із `limit` (1–100, як у likes-пагінатора) — класична сторінкова нарізка, `page` за замовчуванням 1, за межами діапазону → порожній `results` із коректним `info`. Невалідні значення (`page=0`, `limit=abc`) нормалізуються до дефолтів, без 400.
3. **`next`/`prev` — відносні URL** (`/api/releases?page=2&limit=20`): не потребують знання origin і однаково працюють на localhost/stage/prod. Відхилення від Rick&Morty (там абсолютні) — свідоме.
4. **Detail-ендпоінти без змін** (`/api/release/[id]` тощо — одиночний об'єкт, як і `character/[id]` у референсі). Композитні (`/api/release/[id]/related`, `/api/track/[id]`, `/api/profile/summary`) і всі likes/plays-ендпоінти — поза скоупом; наявний приватний `{ data, total }` не мігрується (YAGNI).
5. **Кешування не змінюється**: ключ `defineCachedEventHandler` включає `event.path` (з query), CDN кешує per-URL — пагіновані варіанти кешуються незалежно.

## Дизайн

### Сервер

`server/utils/listEnvelope.ts` — чиста фабрика:

```ts
export interface ListInfo {
  count: number
  pages: number
  next: string | null
  prev: string | null
}
export interface ListEnvelope<T> { info: ListInfo, results: T[] }

export function buildListEnvelope<T>(
  rows: T[],
  options: { path: string, page?: unknown, limit?: unknown },
): ListEnvelope<T>
```

- нормалізує `page`/`limit` (числа з query — рядки; clamp `limit` 1–100, `page >= 1`);
- без `limit` → `results = rows`, `pages = 1`;
- з `limit` → `slice`, `pages = ceil(count/limit)`, `next`/`prev` — `path` + оновлені query.

Кожен list-handler: отримує масив (Supabase як є; Firebase — `Object.values(pickListFields(...))`), читає `getQuery(event)`, повертає `buildListEnvelope(rows, { path: '/api/releases', page, limit })`. `pickListFields` не змінюється (keyed-форма потрібна іншим Firebase-споживачам).

### Клієнт

- **`toArray()`** розширюється одним кроком розгортання: якщо `raw` — об'єкт із масивом `results`, працюємо з ним далі за поточною логікою. Усі ~25 колсайтів лишаються незмінними (сумісність зі старою і новою формою під час перехідного вікна деплою/кешів — CDN може віддавати стару форму до 1h+SWR).
- **Типи**: `app/types/index.ts` — спільний `ApiListResponse<T> = { info: ListInfo, results: T[] }`; `ReleasesResponse` та інші `XxxResponse`-юніони замінюються на нього (виправляє наявну брехню типів). Композабли `useReleases`/`useArtists`/… міняють лише тип-параметр — виклики сторінок через `toArray()` не змінюються.
- **`scripts/web-debug.mjs`**: ітерація list-відповідей — через той самий «array | Object.values | results» fallback (локальна маленька функція).

### Сумісність і ризики

- **Breaking change публічного API** для зовнішніх споживачів (якщо такі є поза сайтом — невідомі). Внутрішні споживачі мігруються в цьому ж зміненні; `toArray()` тримає обидві форми, тож деплой із застарілим CDN-кешем не ламає сторінки.
- Firebase-режим втрачає keyed-форму у відповіді — саме це і є мета уніфікації; `toArray()` на клієнті вже сьогодні перетворює її на масив, тож дані, які бачать сторінки, не змінюються.

### Тести

- Новий `tests/unit/listEnvelope.test.ts`: без limit; з limit (перша/середня/остання сторінка, `next`/`prev`); out-of-range page; невалідні query; clamp limit.
- `tests/unit/releasesApi.test.ts`: оновити — обидва режими повертають `{ info, results }` з масивом і однаковим DTO (тест перестає фіксувати dual shape, починає фіксувати envelope).
- `tests/unit/toArray.test.ts` (новий або розширення): розгортання `results`, зворотна сумісність із Record/масивом.
- Прогін повної сюїти + `npx nuxi typecheck`; live smoke `/releases`, `/artists`, `/tracks`, головна в обох `CATALOG_SOURCE`.

## Порядок відносно інших робіт

Спека незалежна від «розділення release title» (той не чіпає API). Реалізовувати можна в будь-якому порядку; спільних файлів немає, крім `app/types/index.ts` (безконфліктні різні секції).
