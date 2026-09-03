# Аудит TypeScript за скілом typescript (повторний)

- Дата: 2026-09-04
- Гілка: `quality-audits-2026-09` від `accessibility-baseline` (`1667326`)
- Скіл: `.claude/skills/typescript` v1.3.3, розділ «Audit & Hardening» +
  `references/audit.md` (ownership Nuxt-програм)
- Формат: read-only аудит; конфігурацію не змінено (тимчасовий
  `tsconfig.tests.json` для сухого прогону створено й видалено в межах
  сесії). Ремедіації — вхід для спеки й плану тієї самої сесії.
- Попередній аудит: [2026-07-19, розділ 1](2026-07-19-quality-audit.md);
  статус TS-1…TS-5 нижче.

## Обсяг і методика

Перевірено `package.json`, `package-lock.json`, `.nvmrc`, `tsconfig.json`,
`tsconfig.base.json`, `netlify/tsconfig.json`, чотири згенеровані
`.nuxt/tsconfig.{app,server,shared,node}.json`, `.github/workflows/ci.yml`;
90 `.vue` + 58 `.ts` у `app/`, 89 `.ts` у `server/`, 4 у `netlify/`, 56 у
`tests/`, 14 `.mjs` у `scripts/`.

Компілятори: TypeScript `6.0.3` (lockfile), `@typescript/native` `7.0.2`
(alias, лише для `netlify/`), `vue-tsc` `3.3.11`, Node `24.15.0` (`.nvmrc`
збігається з runtime).

```bash
python3 .claude/skills/typescript/scripts/inspect_typescript.py --root . --json
python3 .claude/skills/typescript/scripts/run_typecheck.py --root .
python3 .claude/skills/typescript/scripts/trace_perf.py --root .
node_modules/.bin/vue-tsc --noEmit --extendedDiagnostics -p .nuxt/tsconfig.app.json
node_modules/.bin/tsc --noEmit --extendedDiagnostics -p .nuxt/tsconfig.server.json
node_modules/.bin/vue-tsc --noEmit -p .nuxt/tsconfig.app.json --noUnusedLocals --noUnusedParameters
node_modules/.bin/vue-tsc --noEmit -p .nuxt/tsconfig.app.json --exactOptionalPropertyTypes
node_modules/.bin/vue-tsc --noEmit -p .nuxt/tsconfig.app.json --noFallthroughCasesInSwitch
node_modules/.bin/tsc --noEmit -p .nuxt/tsconfig.server.json --noFallthroughCasesInSwitch --noImplicitOverride
node_modules/.bin/vue-tsc --noEmit -p tsconfig.tests.json   # тимчасовий, extends .nuxt/tsconfig.app.json + tests/**
```

Пробні прапорці рахувалися з дедуплікацією за `file:line:code`: app-програма
Nuxt включає `server/**`, тож server-діагностики — підмножина app-діагностик,
і сума двох прогонів завищила б результат (19 → 32, 37 → 39).

## Фактичний результат

- `npm run typecheck` (nuxi → vue-tsc): 0 діагностик. `npm run typecheck:ts7`
  (TS 7 native, `netlify/`): 0. CI запускає обидва.
- Ефективні прапорці згенерованих програм (це те, що реально перевіряється):

| Програма | strict | noUncheckedIndexedAccess | noImplicitOverride | noFallthroughCasesInSwitch | exactOptionalPropertyTypes | noUnused* | files |
|---|---|---|---|---|---|---|---|
| app (vue-tsc) | ✓ | ✓ | ✓ | – | – | – | 233 |
| server (tsc) | ✓ | ✓ | – | – | – | – | 90 |
| shared | ✓ | ✓ | ✓ | – | – | – | 0 |
| node | ✓ | ✓ | ✓ | – | – | – | 4 |
| netlify (TS 7, extends `tsconfig.base.json`) | ✓ | ✓ | ✓ | ✓ | ✓ | – | 4 |

- Покриття: production 236 covered / 5 uncovered (чотири `netlify/*.ts` — їх
  перевіряє окремий `typecheck:ts7`, і `robots.config.ts`); **tests 0 / 56**;
  config 2 / 3 (`vitest.config.ts`, `playwright.config.ts`, `robots.config.ts`
  не входять у жодну програму).
- Продуктивність: app — 1282 файли, 792 872 instantiations, 647 MB, check
  2.14 с, разом 3.47 с; server — 766 файлів, 1 809 778 instantiations, 228 MB,
  разом 0.31 с. Аномалій немає. `trace_perf.py` для Nuxt повернув `files: 0,
  instantiations: 0` — число знято напряму через `vue-tsc --extendedDiagnostics`.
- Гігієна: `: any` 0, `as any` 0, `@ts-ignore` 0 у всьому репо;
  `@ts-expect-error` 0 у production і 2 у тестах (обидва застарілі — див.
  TS-6); non-null `x!` — 13 у production (було 17), 2 у тестах; `as Xxx`
  casts — 61 у production, з них `as unknown as` — 3.

## Статус знахідок аудиту 2026-07-19

| ID | Суть | Статус |
|---|---|---|
| TS-1 | тести без статичної перевірки | **відкрито**, тепер із доказом шкоди — TS-6 |
| TS-2 | `tsconfig.base.json` не визначає суворість Nuxt | **відкрито** — TS-7; діагностик `exactOptionalPropertyTypes` стало 37 (було 28) |
| TS-3 | 19 невикористаних декларацій | **відкрито без змін** — TS-8, ті самі 19 |
| TS-4 | 17 non-null assertions | **частково**: 13 (сторінка треку зменшила п'ять до трьох) — TS-9 |
| TS-5 | немає лінтера | **відкрито** — TS-10 |

## Знахідки

### TS-6 — Important: 56 тестових файлів поза typecheck, і в них уже 9 діагностик

Сухий прогін `vue-tsc` на `tsconfig.tests.json` (`extends .nuxt/tsconfig.app.json`,
include `tests/**/*.ts`, `vitest.config.ts`, `playwright.config.ts`; без
Vitest-globals, бо тести імпортують API явно) дав 9 діагностик у 4 файлах:

| Файл | Код | Суть |
|---|---|---|
| `tests/unit/releasesApi.test.ts:51,79` | TS2554 ×2 | `handler()` викликається без аргумента, хоча мок `defineEventHandler` повертає функцію з обов'язковим `event` — сигнатура мока розійшлася з реальним handler-ом |
| `tests/unit/perfStats.test.ts:2`, `perfRoutes.test.ts:2` | TS2578 ×2 | `@ts-expect-error` «plain ESM script module without type declarations» більше не потрібен: `scripts/lib/*.mjs` резолвиться (app-програма має `allowJs`), тобто дві застарілі супресії |
| `tests/unit/perfStats.test.ts:12,13,18` | TS18047 ×2, TS2531 | `summarize()` повертає `null` для порожнього масиву, тест читає поля без звуження |
| `tests/e2e/homepage-theme.spec.ts:200,217` | TS2352 ×2 | `window as Window & {…}` без проміжного `unknown` |

Жодна не є runtime-багом, але дві супресії застаріли непомітно, а мок
handler-а має неправильну сигнатуру — саме той клас дрейфу, який TS-1
прогнозував. Vitest транспілює без перевірки типів; CI цього не бачить.

**Рекомендація:** `tsconfig.tests.json` як вище, скрипт `typecheck:tests`
(`vue-tsc --noEmit -p tsconfig.tests.json`), крок у `ci.yml` після
`typecheck`, виправити 9 діагностик. `pretypecheck:tests` має запускати
`prepare:types`, як `pretest:unit`, інакше на чистому клоні немає `.nuxt/`.

### TS-7 — Important: три прапорці базового конфігу не діють у Nuxt (TS-2)

`tsconfig.base.json` успадковує лише `netlify/tsconfig.json`. У `nuxt.config.ts`
немає `typescript.tsConfig` / `nitro.typescript.tsConfig`, тож Nuxt-програми
живуть на дефолтах. Пробні прогони:

| Прапорець | app | server | Унікальних діагностик |
|---|---|---|---|
| `noFallthroughCasesInSwitch` | 0 | 0 | 0 — зелений |
| `noImplicitOverride` (server) | уже ✓ | 0 | 0 — зелений |
| `exactOptionalPropertyTypes` | 37 | 2 | 37 (server ⊂ app) |

37 діагностик `exactOptionalPropertyTypes` розпадаються на три групи:
передавання `x: string | undefined` у optional prop компонента (20, у т.ч.
`OpenImage` на п'яти сторінках, `EntityLinks` на трьох, `PlayerTrackInfo`,
`Item` у `Swiper`); прокидання `props` у reka-ui обгортках `ui/{tooltip,label,sonner}`
(7); об'єкти з `undefined`-полями в `QueueItem`/`PlayerItem`/`SitemapUrlEntry`
(10). Виправлення — додати `| undefined` до optional prop-ів компонентів, які
навмисно приймають `undefined` (це чесніше за фільтрацію на кожному виклику),
і не передавати `undefined` там, де можна пропустити ключ.

**Рекомендація:** увімкнути через `typescript.tsConfig.compilerOptions` і
`nitro.typescript.tsConfig.compilerOptions` у `nuxt.config.ts` спершу два
зелені прапорці, окремим кроком — `exactOptionalPropertyTypes` із 37
правками. Ніколи не редагувати `.nuxt/tsconfig.*.json`.

### TS-8 — Moderate: ті самі 19 невикористаних декларацій (TS-3)

`app/layouts/default.vue:5` (`host`), `app/pages/index.vue:6-9` (чотири
константи логотипів v3.2/v3.3), `app/pages/tracks.vue:80` (`friends`, при
цьому `friends` прибрано зі статистики, а запит `useFriends` лишився — зайвий
SSR-виклик), 13 × `const isDev` у `server/api/*.get.ts`.

**Рекомендація:** прибрати 19 декларацій, потім увімкнути `noUnusedLocals` +
`noUnusedParameters` у обох Nuxt-програмах.

### TS-9 — Minor: 13 non-null assertions (TS-4)

`app/pages/track/[id].vue:30-32` (три `data.value!` після throw-guard, який
компілятор не бачить у closure), `:64` (`split(',')[0]!`),
`server/utils/firebaseCatalog.ts:66,70,71,83` (regex capture groups),
`server/api/track/[id].get.ts:29,30` (`[0]!` після перевірки `length`),
`app/utils/sanitizeHtml.ts:70`, `app/utils/tracks.ts:68`,
`app/components/player/GlobalPlayer.vue:36` (`queue[0]!` після перевірки
`playable.length`).

Усі логічно обґрунтовані; три на сторінці треку знімаються збереженням
звуженого значення в константу перед `computed`, capture groups — через
`?? ''`, `[0]!` після guard — через destructuring `const [first] = …` з
`if (!first) return`.

### TS-10 — Minor: лінтера досі немає (TS-5)

Нуль `any` і супресій тримається дисципліною, не інструментом. Додавання
ESLint — нова залежність, яка чіпає `package-lock.json`; поза скоупом нічної
сесії (див. розділ «Заблоковано»).

### TS-11 — Minor: `trace_perf.py` не бачить Nuxt-програми

`trace_perf.py --root .` повернув `files: 0, instantiations: 0, check_time 0.00`
без діагностики — для проєкту з solution-`tsconfig.json` (`files: []` +
`references`) helper не знаходить програму. Число знято вручну через
`vue-tsc --extendedDiagnostics`. Це знахідка для скіла, не для проєкту;
записана у фідбек.

## Ремедіації, які бере ця сесія

1. TS-6: `tsconfig.tests.json`, `typecheck:tests`, крок CI (перевірити локально
   можна, у CI — лише після пушу), 9 правок у тестах.
2. TS-7: `noFallthroughCasesInSwitch` (app + server) і `noImplicitOverride`
   (server) через `nuxt.config.ts`.
3. TS-8: 19 декларацій + `noUnusedLocals`/`noUnusedParameters`.
4. TS-9: 13 assertions → guard-и.
5. TS-7, крок 2: `exactOptionalPropertyTypes` з 37 правками — останнім, бо
   найдорожчий; якщо не вкладається в сесію, лишається в плані як відкладена
   задача з підрахованим обсягом.

## Заблоковано / потребує рішення

- **TS-10 ESLint** — нова залежність; робоче дерево вже містить чужі
  незакомічені зміни `package.json`/`package-lock.json`, і `npm install`
  змішає їх із новими. Окремий PR після того, як власник закомітить свої
  оновлення залежностей.
- **Прибрати `tsconfig.base.json`** або зробити його справжньою базою для
  Nuxt — рішення власника: зараз він вводить в оману (виглядає як політика
  репо, а діє лише на 4 файли).
