# Catalog visibility security

- Status: Descoped
- Priority: —
- Ініційовано: 2026-07-19
- Last reviewed: 2026-07-25
- Related: [quality audit](../audits/2026-07-19-quality-audit.md), [status audit](../audits/2026-07-25-implementation-status-audit.md)

## Чому знято з обсягу

WEB-1 і VITEST-1 трактували повернення hidden artist як дефект. Поточна
архітектура робить це навмисно: `/artists/all` і `/releases/all` публічно
перелічують усі записи, включно з `visible: false`, а detail endpoints артиста
й релізу відкривають їх за прямим URL.

Публічними межами лишаються list endpoints (`/api/artists`, `/api/releases`,
`/api/events`) і sitemap — `server/utils/sitemapUrls.ts` фільтрує
`visible === true`. Тобто `visible` є прапорцем «не показувати в каталозі й
пошуку», а не access control.

## Поточний контракт

- `server/api/artist/[id].get.ts` і `server/api/release/[id].get.ts` не мають
  visible filter.
- `tests/unit/artistPageApi.test.ts` закріплює `returns hidden artists by direct slug route`.
- AGENTS.md описує це як прийняте продуктове рішення.

## Якщо потрібен справжній access control

Це має бути нова ініціатива з іншою назвою і власним contract: окрема ознака
`private`/`draft`, авторизаційна перевірка на detail handler і виключення з
`*-all` endpoints. Продовженням цієї ініціативи вона не є.
