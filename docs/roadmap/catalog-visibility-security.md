# Catalog visibility security

- Status: Planned
- Priority: P0
- Last reviewed: 2026-07-22
- Related: [quality audit](../audits/2026-07-19-quality-audit.md), [project hardening plan](../superpowers/plans/2026-06-25-project-hardening.md)

## Навіщо

WEB-1 і VITEST-1 підтвердили, що artist detail endpoint повертає hidden record,
а наявний unit-тест прямо закріплює цю неправильну поведінку. List, sitemap та
інші detail contracts уже вважають `visible: false` непублічним.

## Очікуваний результат

Firebase і Supabase detail paths однаково повертають 404 для hidden artist, а
unit та browser security contracts більше не суперечать одне одному.

## Обсяг

- Застосувати один `isPublicEntity` guard до artist detail handler.
- Додати окремі Firebase і Supabase regression tests.
- Інвертувати hidden-success unit contract.
- Запустити security E2E в обох catalog modes.

## Залежності

- WEB-1 і VITEST-1 із quality audit.
- CI має вміти перевіряти обидва значення `CATALOG_SOURCE`.

## Критерії завершення

- Hidden artist повертає 404 у Firebase і Supabase modes.
- Public artist і response shape не змінені.
- Unit та Playwright security tests проходять для обох backends.

## Наступний крок

Написати dual-backend failing unit contracts, після чого додати мінімальний shared guard.
