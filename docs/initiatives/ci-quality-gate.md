# CI quality gate

- Status: Partial
- Priority: P0
- Ініційовано: 2026-06-26
- Last reviewed: 2026-07-25
- Related: [quality audit](../audits/2026-07-19-quality-audit.md), [spec](../superpowers/specs/2026-07-19-ci-quality-gate-design.md), [plan](../superpowers/plans/2026-07-19-ci-quality-gate.md)

## Навіщо

`.github/workflows/ci.yml` уже запускає `typecheck`, `typecheck:ts7`,
unit tests, `node-server` build і HTTP smoke на push/PR. Але він не запускає
Playwright і не перевіряє production Netlify preset, тому клас помилок
ESM/CJS у lambda й browser regressions лишається непокритим. Git-triggered
deploy також не гарантує очікування required checks.

## Очікуваний результат

Pull request і production deploy проходять через відтворюваний quality gate,
який ловить browser regressions і Netlify lambda bundling failures.

## Обсяг

- Додати Netlify-preset build до наявного workflow.
- Додати окремий функціональний Playwright job.
- Задокументувати required checks і заборону `sync:*` у CI.
- Налаштувати branch protection через GitHub UI.

## Залежності

- [E2E reliability](e2e-reliability.md) для стабільних browser tests.
- Ручне налаштування branch protection власником репозиторію.

## Критерії завершення

- CI має зелені `smoke` і `e2e` jobs.
- Netlify-preset build компілюється у CI.
- Навмисно зламаний тест блокує merge.
- Production deploy policy задокументована й не запускає `sync:*`.

## Наступний крок

Реалізувати готовий CI quality-gate plan і перевірити його на окремому pull request.
