# API list envelope

- Status: Planned
- Priority: P1
- Last reviewed: 2026-07-22
- Related: [spec](../superpowers/specs/2026-07-19-api-list-envelope-design.md), [plan](../superpowers/plans/2026-07-19-api-list-envelope.md)

## Навіщо

List API responses не мають єдиного місця для pagination/source metadata, а
Firebase object та Supabase array shapes протікають до клієнтських споживачів.

## Очікуваний результат

Усі catalog list endpoints повертають `{ info, results }`, а клієнтські helpers
однаково розгортають результат для обох backends.

## Обсяг

- Додати pure `buildListEnvelope`.
- Перевести catalog list handlers.
- Оновити `toArray`, types і прямі `$fetch` consumers.
- Перевірити Firebase та Supabase live smoke.

## Залежності

- Публічний API contract потребує атомарної міграції server і client consumers.

## Критерії завершення

- Вісім list endpoints мають однаковий envelope.
- `toArray` і direct consumers не втрачають ordering/visibility.
- Unit suite, typecheck і dual-backend smoke проходять.

## Наступний крок

Виконати TDD reference migration для `/api/releases`, потім механічно перевести решту.
