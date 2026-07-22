# E2E reliability

- Status: Planned
- Priority: P1
- Last reviewed: 2026-07-22
- Related: [quality audit](../audits/2026-07-19-quality-audit.md), [CI initiative](ci-quality-gate.md)

## Навіщо

WEB-3, WEB-5 і WEB-6 виявили, що browser suite не є CI gate, mobile first-paint
assertion залежить від scheduler race, а route smoke не охоплює track detail і
частину auth routes.

## Очікуваний результат

Функціональний browser suite стабільно ловить SSR/hydration, console, assets,
navigation і visibility regressions для критичних маршрутів у двох catalog modes.

## Обсяг

- Замінити timing-racy first-paint assertion на resource/paint або чіткий state contract.
- Додати dynamic track detail і решту auth SSR probes.
- Додати broken-image і console/page-error assertions.
- Запускати functional suite в CI для Firebase та Supabase paths.

## Залежності

- WEB-3, WEB-5 і WEB-6 із quality audit.
- [CI quality gate](ci-quality-gate.md).

## Критерії завершення

- Повторні mobile runs не мають flaky first-paint failures.
- Track/auth маршрути входять у smoke coverage.
- Functional browser suite зелений у CI для обох catalog modes.

## Наступний крок

Інструментувати resource timing для forest asset і зафіксувати deterministic contract.
