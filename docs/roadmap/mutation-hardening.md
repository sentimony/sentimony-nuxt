# Mutation validation and rate limiting

- Status: Planned
- Priority: P2
- Last reviewed: 2026-07-22
- Related: [spec](../superpowers/specs/2026-07-19-server-hardening-design.md), [plan](../superpowers/plans/2026-07-19-server-hardening.md)

## Навіщо

Likes і plays mutations мають лише базову перевірку slug та не мають узгодженої
existence validation або rate limiting.

## Очікуваний результат

Shared validation захищає mutations від malformed/non-public slugs і надмірної
частоти, не змінюючи happy-path response contracts.

## Обсяг

- Додати shared slug normalization і length/shape validation.
- Перевіряти існування public entity перед записом.
- Додати rate limiting до likes і plays.
- Розширити API security coverage.

## Залежності

- [Catalog visibility security](catalog-visibility-security.md).
- Розподілений limiter може потребувати зовнішнього store; початковий in-memory
  варіант має бути явно задокументований як per-instance.

## Критерії завершення

- Invalid і non-public slugs відхиляються до database mutation.
- Rate limit має детерміновані тести.
- Happy-path відповіді likes/plays не змінені.
- API security tests проходять.

## Наступний крок

Почати з pure slug validator і його unit contract.
