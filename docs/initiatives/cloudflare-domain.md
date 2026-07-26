# Cloudflare domain and platform migration

- Status: Planned
- Priority: P2
- Ініційовано: 2026-07-22
- Last reviewed: 2026-07-26
- Related: [spec](../superpowers/specs/2026-07-26-cloudflare-migration-design.md), [plan](../superpowers/plans/2026-07-26-cloudflare-migration.md), [documentation organization spec](../superpowers/specs/2026-07-22-documentation-organization-design.md)

## Навіщо

Cloudflare дає централізоване DNS/CDN керування, WAF і шлях до Workers. Частина
інфраструктури вже там: аудіо каталогу роздається з R2, але через небрендований
`pub-*.r2.dev`. Водночас Nuxt runtime, deploy contexts, cache-заголовки та edge
functions прив'язані до Netlify.

## Очікуваний результат

Переїзд виконано поетапно, і кожен крок підкріплений замірами першого
завантаження, знятими однаковим інструментом до і після.

## Обсяг

- Фаза 0: інструмент замірів (`scripts/perf-baseline.mjs`) і baseline «до».
- Фаза 1: делегування зони з Imena.ua на Cloudflare у режимі DNS-only.
- Фаза 2: runtime на Workers (`cloudflare_module`) з перевіркою трьох припущень —
  розмір бандла, `CDN-Cache-Control`, поведінка Nitro-кешу.
- Фаза 3: cutover прода з повторними замірами й перевіреним відкатом.
- Фаза 4 (опційно): `audio.sentimony.com`, чистка `img.sentimony.com`.

## Залежності

- Інвентар DNS, піддоменів і Netlify-сайтів — знято 2026-07-26, зафіксовано у спеці.
- Від користувача: Cloudflare API token, додавання зони, зміна NS у Imena.ua,
  апрув трьох воріт. Опційно `PSI_API_KEY`.

## Критерії завершення

- Є заповнена таблиця «до / після» по кожному типу сторінки, cold і warm окремо.
- Заміри після фази 1 збігаються з baseline у межах ±15%.
- Редиректи й блокування відтворені та покриті тестами до видалення edge-функцій.
- Кожна фаза має перевірений, а не лише задекларований відкат.

## Наступний крок

Виконати фазу 0: спільний `scripts/lib/routes.mjs`, `scripts/perf-baseline.mjs`,
baseline по проду і stage, вимір розміру Worker-бандла.
