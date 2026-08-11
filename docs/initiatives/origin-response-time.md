# Origin response time

- Status: Implemented
- Priority: P1
- Ініційовано: 2026-08-11
- Last reviewed: 2026-08-11
- Related: [spec](../superpowers/specs/2026-08-11-origin-response-time-design.md), [plan](../superpowers/plans/2026-08-11-origin-response-time.md), [mobile performance](mobile-performance.md), [cloudflare domain](cloudflare-domain.md)

## Навіщо

Lighthouse-аудит `server-response-time` на проді проходить (190 мс desktop,
280 мс mobile, 430 мс на холодній detail-сторінці при порозі 600 мс), тобто
рекомендації *Reduce initial server response time* зараз немає. Але проходить
він завдяки теплому edge-кешу: сам origin відповідає за 0.4–0.8 с, Netlify
Durable Cache був вимкнений (`cache-status: "Netlify Durable"; fwd=bypass`), а
cache key HTML варіювався за повним query string, тож будь-який перехід з
`?utm_source=…` гарантовано діставав холодний SSR.

## Очікуваний результат

Origin прибрано з типового шляху відвідувача: промахи кешу трапляються рідше,
а кампанійний трафік з рекламними мітками потрапляє в той самий cache-об'єкт,
що й чистий URL.

## Обсяг

- `durable` у `Netlify-CDN-Cache-Control` для публічного HTML і публічних
  catalog/counter API; `private, no-store` маршрути не змінені.
- `Netlify-Vary: query=_` на кешованому HTML — cache key перестає залежати від
  query-параметрів, яких застосунок не читає.
- Стандартний `CDN-Cache-Control` лишається без вендорної директиви, щоб
  політика зберігала переносимість на інший CDN.

## Залежності

Немає: обидві зміни живуть у чистих утилітах політики заголовків і покриті
unit-тестами.

## Критерії завершення

- `cache-status` на публічному HTML показує Durable-шар замість `fwd=bypass`. ✅ код
- URL з `utm_source` дає той самий cache-об'єкт, що й чистий. ✅ код
- `test:unit`, `typecheck`, `docs:check` зелені. ✅

## Наступний крок

Після деплою зняти заголовки й Lighthouse повторно. Якщо origin усе ще на
критичному шляху — окремо оцінити перенесення Nitro cache storage на Netlify
Blobs (нова залежність `@netlify/blobs`, деталі в спеці).
