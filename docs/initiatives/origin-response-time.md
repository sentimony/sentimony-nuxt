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
- TTL публічного HTML — доба замість години, `stale-while-revalidate` — тиждень:
  каталог змінюється на деплої, а не за годинником.
- `GET /api/track-plays` віддає публічні лічильники й кешується як counter-роут;
  заголовки виставляє хендлер, бо `routeRules` не розрізняють GET і POST на
  одному шляху. До цього кожен перегляд detail-сторінки будив функцію.
- `/api/artists-all` і `/api/releases-all` додані до catalog-маршрутів — раніше
  вони лишались без `CDN-Cache-Control` і без durable-шару.

## Залежності

Немає: обидві зміни живуть у чистих утилітах політики заголовків і покриті
unit-тестами.

## Критерії завершення

- `cache-status` на публічному HTML показує Durable-шар замість `fwd=bypass`. ✅ перевірено на stage
- URL з `utm_source` дає той самий cache-об'єкт, що й чистий. ✅ перевірено на stage
- `GET /api/track-plays` дає `hit` на повторі, `POST` лишається `private, no-store`. ✅ перевірено на stage
- `test:unit`, `typecheck`, `docs:check` зелені. ✅

Заміри — [аудит 2026-08-11](../audits/2026-08-11-branch-vs-prod-perf-audit.md).

## Другий драйвер: ліміт функцій Netlify

Free-план дає 125 000 викликів функцій на місяць, і 2026-08-01 команда його
перевищила (`usages_exceeded: functions`, `sites_with_usage_exceeded` містить
лише `sentimony-nuxt`). Пауза за перевищення накриває всі 30 сайтів команди,
включно з `content.sentimony.com`, тобто разом із SSR відвалились би всі
зображення. Це переводить кешування з питання швидкості в питання доступності.

Порахований Playwright'ом внесок на перегляд: список-сторінки роблять 1 запит
до API (counter, кешований), detail-сторінки — 3–5, і серед них був
`GET /api/track-plays` з `no-store`, тобто гарантований виклик функції на кожен
перегляд релізу чи артиста.

## Наступний крок

Якщо викликів усе ще забагато — [function invocation budget](function-invocation-budget.md),
де зібрані кандидати: TTL counter-роутів, prerender каталогу, Netlify Blobs.
