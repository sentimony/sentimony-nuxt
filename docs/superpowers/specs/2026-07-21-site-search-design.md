# Site search (⌘K palette)

Дата: 2026-07-21. Гілка: `main`.

## Контекст

- Пошуку на сайті немає (жодного search-коду в `app/`).
- Каталог малий: ~770 треків, кілька сотень інших сутностей — сумарно ~1–2 тис. записів.
- shadcn-vue видалено з проєкту; reka-ui (`^2.10.1`) лишилась — компоненти будуємо напряму на ній.
- Каталог-endpoint'и вже мають кеш-стек: `defineCachedEventHandler` + `catalogCacheOptions()` (server) і `buildApiRouteRules()` (CDN).

## Рішення

**Scope:** усі шість сутностей каталогу (releases, artists, tracks, videos, events, playlists). UI — палітра-діалог (іконка в хедері + ⌘K). Пошук виконується на клієнті по легкому індексу; матчинг — простий substring без нових залежностей.

### 1. Endpoint `/api/search-index`

`server/api/search-index.get.ts` через `defineCachedEventHandler(catalogCacheOptions(...))`; CDN-заголовки — додати роут у `buildApiRouteRules()` (каталожна політика `public, max-age=3600, swr=86400`). Повертає плаский масив:

```ts
interface SearchIndexEntry {
  type: 'release' | 'artist' | 'track' | 'video' | 'event' | 'playlist'
  slug: string
  title: string
  subtitle?: string // artist_name для треків/релізів, кат-номер тощо
}
```

Читає з активного `catalogSource` наявними fetch-хелперами, нормалізує об'єктні Firebase-відповіді (`toArray`-патерн на сервері), фільтрує `visible`, віддає лише перелічені поля (~30–60 КБ).

### 2. Клієнт

- **`app/utils/searchFilter.ts`** — чисті функції: `normalizeQuery()` (lowercase + `normalize('NFD')` зі зрізанням діакритики) і `filterSearchIndex(entries, query)` — substring по `title` + `subtitle` + `slug`, групування за `type`, ліміт 8 на групу, порядок груп releases → artists → tracks → videos → events → playlists. Порожній запит → порожній результат.
- **`app/composables/useSearch.ts`** — стан відкриття (`useState('search-open')`), lazy `$fetch('/api/search-index')` при першому відкритті з кешуванням у пам'яті; помилка завантаження → `toast.error` (vue-sonner) + скидання прапорця для повторної спроби при наступному відкритті (патерн `countsLoaded` із `createLikes`).
- **`app/components/SearchDialog.vue`** — reka-ui `DialogRoot` + `ListboxRoot`: навігація стрілками, Enter → `navigateTo('/{type-route}/{slug}')` + закриття. Глобальний `keydown`-лісенер ⌘K / Ctrl+K усередині компонента. Стилі — Tailwind, dark-first, у дусі наявних компонентів. Порожній запит показує placeholder-підказку, не рендерить каталог.
- **Монтування**: `<SearchDialog>` один раз в `app/app.vue` (поруч із `<Toaster>`); у `Header.vue` — кнопка з `lucide:search`, що відкриває стан.

## Тести

- Vitest unit: `searchFilter` (нормалізація, діакритика, ліміти, порядок груп, порожній запит) + хендлер `search-index` за патерном `tests/unit/likeCountersHandler.test.ts` (обидва режими catalogSource за доцільності).
- E2E не додаємо. Верифікація: `npm run test:unit`, `npx nuxi typecheck`.

## Поза scope

- Fuzzy-матчинг, окрема сторінка `/search`, серверний query-endpoint, аналітика запитів.
