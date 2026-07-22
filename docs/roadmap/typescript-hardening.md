# TypeScript hardening

- Status: Planned
- Priority: P1
- Last reviewed: 2026-07-22
- Related: [quality audit](../audits/2026-07-19-quality-audit.md)

## Навіщо

TS-1–TS-5 і VITEST-3 показали, що test TypeScript не перевіряється статично,
частина strictness flags живе лише в неуспадкованому base config, unused code не
блокується, а type-safety conventions не захищені lint rules.

## Очікуваний результат

Application, server, edge і tests мають явні зелені typecheck contours, а нові
unused declarations, unsafe suppressions і невиправдані assertions ловляться до merge.

## Обсяг

- Додати `tsconfig.tests.json` і `typecheck:tests` у CI.
- Підключити зелені `noFallthroughCasesInSwitch` та `noImplicitOverride` до Nuxt.
- Очистити declarations і ввімкнути unused checks.
- Окремо мігрувати `exactOptionalPropertyTypes`.
- Скоротити non-null assertions і додати ESLint type-safety guardrails.

## Залежності

- TS-1, TS-2, TS-3, TS-4, TS-5 та VITEST-3 із quality audit.
- Міграції flags виконуються окремими кроками, щоб diagnostics лишалися зрозумілими.

## Критерії завершення

- Application, server, edge і tests typecheck проходять локально та в CI.
- Увімкнені strictness/unused flags не мають diagnostics.
- Lint блокує explicit `any`, `@ts-ignore` і погоджені unsafe patterns.

## Наступний крок

Спочатку спроєктувати ізольований `tsconfig.tests.json` без Vitest globals у production configs.
