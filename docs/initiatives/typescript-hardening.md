# TypeScript hardening

- Status: Partial
- Priority: P1
- Ініційовано: 2026-07-19
- Last reviewed: 2026-09-04
- Related: [quality audit](../audits/2026-07-19-quality-audit.md), [typescript audit 2026-09-04](../audits/2026-09-04-typescript-audit.md), [spec](../specs/2026-09-04-typescript-hardening-design.md), [plan](../plans/2026-09-04-typescript-hardening.md)

## Навіщо

TS-1–TS-5 і VITEST-3 показали, що test TypeScript не перевіряється статично,
частина strictness flags живе лише в неуспадкованому base config, unused code не
блокується, а type-safety conventions не захищені lint rules.

Закрито 2026-09-04: `typecheck:tests` (`tsconfig.tests.json`, у CI),
`noFallthroughCasesInSwitch` + `noImplicitOverride` в обох Nuxt-програмах,
`noUnusedLocals`/`noUnusedParameters` після видалення 19 декларацій, нуль
non-null assertions у `app/`, `server/`, `netlify/`. Лишаються
`exactOptionalPropertyTypes` і ESLint guardrails.

`exactOptionalPropertyTypes` пробували 2026-09-04 (задача 6 плану): 39
діагностик у app/server, з них 7 у обгортках `ui/{tooltip,label,input,sonner}`
— Vue типізує resolved props як `x: T | undefined`, а `v-bind="props"` у
reka-ui/vue-sonner очікує `x?: T` без `undefined`; без кастів на кожній
обгортці прапорець не проходить. Прапорець відкочено; повернутися після
оновлення Vue/reka-ui або з рішенням про типізований `compact()`-хелпер.

## Очікуваний результат

Application, server, edge і tests мають явні зелені typecheck contours, а нові
unused declarations, unsafe suppressions і невиправдані assertions ловляться до merge.

## Обсяг

- ✓ `tsconfig.tests.json` і `typecheck:tests` у CI.
- ✓ Зелені `noFallthroughCasesInSwitch` та `noImplicitOverride` через `nuxt.config.ts`.
- ✓ Declarations очищено, unused checks увімкнено.
- ✓ Non-null assertions замінено guard-ами.
- Окремо мігрувати `exactOptionalPropertyTypes` (заблоковано типами Vue props, див. вище).
- Додати ESLint type-safety guardrails (потребує нової залежності).

## Залежності

- TS-1, TS-2, TS-3, TS-4, TS-5 та VITEST-3 із quality audit.
- Міграції flags виконуються окремими кроками, щоб diagnostics лишалися зрозумілими.

## Критерії завершення

- Application, server, edge і tests typecheck проходять локально та в CI.
- Увімкнені strictness/unused flags не мають diagnostics.
- Lint блокує explicit `any`, `@ts-ignore` і погоджені unsafe patterns.

## Наступний крок

Обрати ESLint-конфіг разом із `chore(deps)`; `exactOptionalPropertyTypes` — після рішення про обгортки reka-ui.
