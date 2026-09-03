# TypeScript hardening: тести під typecheck, зелені прапорці, гігієна

**Дата:** 2026-09-04
**Статус:** Design
**Скоуп:** `tsconfig.tests.json` (новий), `package.json` (скрипти), `.github/workflows/ci.yml`, `nuxt.config.ts` (`typescript.tsConfig`, `nitro.typescript.tsConfig`), 4 тестові файли з діагностиками, 19 файлів із невикористаними деклараціями, 8 файлів із non-null assertions, `AGENTS.md`
**Джерело:** [аудит TypeScript 2026-09-04](../audits/2026-09-04-typescript-audit.md) (TS-6…TS-9), [аудит Vitest 2026-09-04](../audits/2026-09-04-vitest-audit.md) (VITEST-3)
**Ініціатива:** [typescript-hardening](../initiatives/typescript-hardening.md)

## Проблема

Три знахідки аудиту 2026-07-19 відкриті без змін півтора місяця, і одна з них
тепер має доказ шкоди: 56 тестових файлів не проходять typecheck, а сухий
прогін показує 9 діагностик, серед них дві застарілі `@ts-expect-error` і
мок `defineEventHandler` із сигнатурою, що розійшлася з реальною.
`tsconfig.base.json` виглядає як політика репо, а діє на чотири файли в
`netlify/`; Nuxt-програми не мають `noFallthroughCasesInSwitch`, server —
`noImplicitOverride`, обидва прапорці зелені на пробному прогоні. 19
невикористаних декларацій — ті самі, що й у липні.

## Рішення

### 1. Окрема програма для тестів, без Vitest-globals у production

`tsconfig.tests.json` у корені:

```json
{
  "extends": "./.nuxt/tsconfig.app.json",
  "include": [".nuxt/nuxt.d.ts", "tests/**/*.ts", "vitest.config.ts", "playwright.config.ts"],
  "exclude": []
}
```

- `extends` generated app-програму, бо тести імпортують `server/utils/*`,
  `app/utils/*` і `~/types` через ті самі alias-и; власний `paths` дублював
  би Nuxt.
- `exclude: []` перекриває generated `exclude`, який відсікає `../tests/**`
  поза `tests/nuxt/`.
- Vitest і Playwright імпортують API явно (`import { describe } from 'vitest'`),
  тож `types` не потрібні і production-програми не отримують тестових
  глобалів.
- Скрипти: `"typecheck:tests": "node_modules/.bin/vue-tsc --noEmit -p tsconfig.tests.json"`
  і `"pretypecheck:tests": "npm run prepare:types"`, бо на чистому клоні
  `.nuxt/tsconfig.app.json` ще немає (той самий хук, що в `pretest:unit`).
- CI: третій крок у job `typecheck` після `typecheck:ts7`. Локально
  перевіряється лише сам скрипт; крок workflow — після пушу.

### 2. Дев'ять діагностик — по суті, не супресіями

| Файл | Виправлення |
|---|---|
| `tests/unit/releasesApi.test.ts:51,79` | тип `handler` іде з реального `defineEventHandler` Nitro, а не з мока; викликати `handler(fakeEvent())`, де `fakeEvent()` — `{} as unknown as H3Event` з `tests/setup/nitroMocks.ts` (спека Vitest). Cast на межі мока в тестах дозволений скілом |
| `tests/unit/perfStats.test.ts:2`, `perfRoutes.test.ts:2` | прибрати `@ts-expect-error`: app-програма має `allowJs`, `scripts/lib/*.mjs` типізуються з JSDoc/інференсу |
| `tests/unit/perfStats.test.ts:12,13,18` | `summarize()` повертає `null` для порожнього масиву — звузити: `const result = summarize([5, 1, 3]); expect(result).not.toBeNull(); expect(result?.min).toBe(1)` або окремий тест на `null` |
| `tests/e2e/homepage-theme.spec.ts:200,217` | `window as unknown as Window & { __viewTransitionCalls: number }` |

### 3. Прапорці — через владні ключі Nuxt

```ts
typescript: {
  tsConfig: { compilerOptions: { noFallthroughCasesInSwitch: true, noUnusedLocals: true, noUnusedParameters: true } },
},
nitro: {
  preset: …,
  typescript: { tsConfig: { compilerOptions: { noImplicitOverride: true, noFallthroughCasesInSwitch: true, noUnusedLocals: true, noUnusedParameters: true } } },
},
```

`.nuxt/tsconfig.*.json` не редагуються; `npm run prepare:types` регенерує їх,
і перевірка «прапорець справді діє» — читання згенерованого JSON після
prepare. `tsconfig.tests.json` extends app-програму, тож `noUnused*`
поширюється на тести — очікувати кілька додаткових діагностик там і
виправляти їх у тій самій задачі.

`exactOptionalPropertyTypes` — окремий, останній крок із 37 правками
(20 передавань `undefined` у optional prop, 7 reka-ui обгорток, 10 об'єктів
з `undefined`-полями). Правило: optional prop, який навмисно приймає
`undefined`, оголошується `x?: T | undefined`; там, де ключ можна пропустити
— пропускати. Якщо крок не вкладається в сесію, він лишається в плані як
розмічена, невиконана задача, а не напівзастосований прапорець.

### 4. Гігієна

- 19 невикористаних декларацій: `host` (`layouts/default.vue`), чотири
  константи логотипів (`pages/index.vue`), `friends` + виклик `useFriends()`
  (`pages/tracks.vue` — це також мінус один SSR-запит, зазначити в коміті),
  13 × `isDev` у `server/api/*.get.ts`.
- 13 non-null assertions → guard-и: три `data.value!` на сторінці треку
  через збережену константу після throw-guard; regex capture groups через
  `?? ''`; `[0]!` після перевірки `length` через destructuring з early return.
  Без широких cast-ів.

## Не входить

- ESLint (нова залежність, заблокована незакоміченим `package-lock.json`).
- Доля `tsconfig.base.json` (рішення власника: зробити базою для Nuxt через
  `extends` неможливо — Nuxt генерує свої; або перейменувати в
  `netlify/tsconfig.base.json`, або лишити з коментарем).

## Перевірка

`npm run test:unit && npm run typecheck && npm run typecheck:tests && npm run docs:check`
зелене після кожної задачі; `npm run typecheck:ts7` — після зміни
`tsconfig.base.json`, якщо вона буде. Прапорці підтверджуються в
`.nuxt/tsconfig.app.json` і `.nuxt/tsconfig.server.json` після `prepare:types`.

## Наступний крок

План: [`docs/plans/2026-09-04-typescript-hardening.md`](../plans/2026-09-04-typescript-hardening.md).
