# Аудит Vitest за скілом vitest (повторний)

- Дата: 2026-09-04
- Гілка: `quality-audits-2026-09` від `accessibility-baseline` (`1667326`)
- Скіл: `.claude/skills/vitest` v1.2.1, `references/audit.md` §1–§7
- Формат: read-only аудит; конфігурацію тестів не змінено. Ремедіації — вхід
  для спеки й плану тієї самої сесії.
- Попередній аудит: [2026-07-19, розділ 3](2026-07-19-quality-audit.md);
  статус VITEST-1…VITEST-6 нижче.

## Обсяг і методика

Перевірено `vitest.config.ts`, `tests/setup/nitro-globals.ts`, 52 unit-файли
в `tests/unit/`, 3 Playwright-специфікації в `tests/e2e/`, скрипти
`package.json`, `.github/workflows/ci.yml`, залежності для coverage і DOM.

```bash
python3 .claude/skills/vitest/scripts/inspect_vitest.py --root . --json
python3 .claude/skills/vitest/scripts/run_vitest.py --root .
node_modules/.bin/vitest run --sequence.shuffle --sequence.seed=20260904
```

Оточення: Node `24.15.0` (`.nvmrc` збігається), npm, **Vitest `5.0.0`** у
`node_modules` — при цьому закомічений `package.json` каже `^4.1.11`, а
незакомічена робоча копія — `^5.0.0` (див. VITEST-7). Прогони йшли паралельно
з `vue-tsc`-прогонами TypeScript-аудиту, тож тривалості нижче не порівнювати
з 2026-07-19 напряму.

## Фактичний результат

- Інспектор: `vitest: 1` конфіг, `projects: 0`, `frameworks: ["nuxt"]`,
  `test_runner: package-script`, `filesystem_candidates.lower_bound: 55`
  (`truncated: false`), `findings: []`.
- Звичайний прогін (`run_vitest.py` → `node_modules/.bin/vitest run`): **52
  файли, 272 тести, 0 падінь, 831 мс**. Різниця з кандидатами (55 − 52 = 3) —
  рівно три `tests/e2e/*.spec.ts`, які `include: ['tests/unit/**/*.test.ts']`
  відсікає; пояснено конфігом, не припущенням.
- Shuffle із seed `20260904`: 52 / 272, 0 падінь, 775 мс. Порядок не впливає.
- Чистий вивід: жодного `console.warn`/`console.error`/stderr від тестів.
  Єдиний шум — `[@nuxt/supabase] WARN Missing NUXT_PUBLIC_SUPABASE_KEY` з
  хука `pretest:unit` → `prepare:types`, коли секретів немає локально; AGENTS.md
  прямо називає це очікуваним, тож класифіковано як відомий навмисний вивід.
- Гігієна: `.only`/`.skip`/`.todo` — 0; snapshots — 0; fake timers — 0;
  `vi.mock` — 1 файл; `globalThis`-моки Nitro auto-imports — 10 файлів, з них
  `afterEach` — 10, `vi.restoreAllMocks` — 9, `vi.resetModules` — 8.
- Coverage: провайдер (`@vitest/coverage-v8`/`istanbul`) не встановлено; у
  `node_modules/@vitest` лише `mocker` і `spy`. Coverage не збирався.
- CI-паритет: `ci.yml` job `unit` — `npm ci` + `npm run test:unit` на Node з
  `.nvmrc`, ті самі `pretest:unit` хуки (`convert:yml` + `prepare:types`), без
  coverage, без shuffle. Локальна команда тотожна.
- Vitest 5 у виводі пропонує `isolate: false` (52 воркери × ~87 мс стартап,
  «at least ~414ms faster»). Це підказка, не знахідка: 10 файлів пишуть у
  `globalThis` і покладаються на ізоляцію файлів.

## Статус знахідок аудиту 2026-07-19

| ID | Суть | Статус |
|---|---|---|
| VITEST-1 | unit-тест закріплював hidden-artist exposure | **закрито структурно**: у roadmap `catalog-visibility-security` знято з обсягу — приховані detail-сторінки відкриті навмисно, тест і e2e узгоджені з цим рішенням |
| VITEST-2 | компоненти тестуються читанням джерела | **відкрито, зросло** — VITEST-8 |
| VITEST-3 | тести без typecheck | **відкрито** — закривається разом із TS-6 (TypeScript-аудит 2026-09-04) |
| VITEST-4 | немає coverage | **відкрито** — VITEST-9 |
| VITEST-5 | ручні `globalThis`-моки | **відкрито**, але з централізованим shim — VITEST-10 |
| VITEST-6 | mock reset policy | **відкрито** — VITEST-11 |

## Знахідки

### VITEST-7 — Important: версія Vitest у робочій копії й у коміті різна

`node_modules/vitest` — `5.0.0`; закомічений `package.json` — `^4.1.11`
(lockfile у `HEAD` — `4.1.11`); робоча копія `package.json` — `^5.0.0`
(незакомічена). Поруч лежить untracked `.nuxtrc` із
`setups.@nuxt/test-utils="4.2.0"`, при тому що `@nuxt/test-utils` у
`node_modules` немає. Прогон зелений на 5.0.0, але CI на `npm ci` з
закоміченим lockfile поставить 4.1.11 — це два різні мажори одного runner-а
під одним «зелено».

**Рекомендація:** закомітити бамп окремим `chore(deps)` (це рішення й дія
власника — зміни його), і або завершити встановлення `@nuxt/test-utils`, або
видалити `.nuxtrc`, щоб він не вводив в оману наступний `nuxt prepare`.

### VITEST-8 — Important: 19 із 52 файлів (37 %) читають джерело як текст

`readFileSync` по `.vue`/`.ts`/`.css` — у 19 файлах (було 13 із 39), і в них
112 із 248 `it(` (45 %). Найбільші: `interactionStates.test.ts` (24),
`profilePages.test.ts` (15), `likedTracksColumns.test.ts` (11),
`accessibleNames.test.ts` (7), `authPages.test.ts` (7).

Це свідома проєктна конвенція — AGENTS.md і плани описують «тест читає
джерело як рядок» як спосіб закріпити інваріанти стилів і атрибутів без
DOM-середовища, і для інваріантів на кшталт «фокус-правило поза `@layer`»
чи «рівно один `<main>`» вона працює. Але половина suite тепер перевіряє
текст, а не поведінку: чи компонент монтується, чи `aria-label` справді
потрапляє в DOM, чи `CollectionStatus` перемикає стани — не доводить жоден
тест. Refactor, який зберігає поведінку, але змінює форматування, ламає їх;
runtime-дефект у шаблоні — ні.

**Рекомендація:** не переписувати наявні source-тести (вони дешеві й
стабільні), а зупинити зростання частки: новий інваріант структури —
source-тест, нова поведінка — компонентний тест. Компонентний harness
(`@nuxt/test-utils` + `happy-dom`) — нова залежність, заблокована станом
lockfile (VITEST-7); зафіксувати рішення в `component-testing-and-coverage.md`
і почати з одного пілота після `chore(deps)`.

### VITEST-9 — Moderate: coverage не збирається (VITEST-4)

Провайдера немає, конфігу немає, CI не збирає. Число 272 не каже, які гілки
`server/utils/likes.ts`, `cachePolicy.ts` чи `sanitizeHtml.ts` реально
виконуються. Встановлення `@vitest/coverage-v8` — нова залежність, заблокована
VITEST-7.

**Рекомендація:** після `chore(deps)` — `coverage.include: ['app/**/*.{ts,vue}', 'server/**/*.ts']`,
`exclude` для `server/data/**`, `app/types/**`; спершу baseline без порогів.

### VITEST-10 — Moderate: `globalThis`-моки без спільного хелпера (VITEST-5)

`tests/setup/nitro-globals.ts` дає один passthrough для `defineCachedFunction`;
решту auto-imports (`defineEventHandler`, `defineCachedEventHandler`,
`fetchFirebaseCollection`, `supabaseAdmin`, `useRuntimeConfig`, …) кожен із
10 файлів ставить на `globalThis` сам, зі своїми `afterEach`. Shuffle і
звичайний прогін чисті, тобто cleanup працює, але кожен новий handler-тест
копіює 15–25 рядків налаштування, і саме тут живуть 2 із 9 діагностик TS-6
(мок `defineEventHandler` повертає функцію з обов'язковим `event`, тести
викликають `handler()` без нього).

**Рекомендація:** `tests/setup/nitroMocks.ts` з `installNitroGlobals({...})`,
що повертає `restore()`, і типізованою сигнатурою `defineEventHandler`, яка
збігається з реальною; мігрувати 10 файлів. Без нових залежностей.

### VITEST-11 — Minor: mock reset policy лишається неявною (VITEST-6)

`vitest.config.ts` не має `restoreMocks`/`clearMocks`/`mockReset`; 9 файлів
роблять `vi.restoreAllMocks()` вручну, 1 файл із `vi.mock` — ні. Shuffle
зелений, отже дефекту немає.

**Рекомендація:** `restoreMocks: true` у конфізі + видалити 9 ручних викликів
після зеленого прогону; або задокументувати ручний cleanup як конвенцію в
AGENTS.md. Перше — менше коду; обираємо його, якщо shuffle після зміни
лишається зеленим.

### VITEST-12 — Minor: `include` не охоплює майбутні `tests/nuxt/**`

`.nuxt/tsconfig.app.json` уже включає `../tests/nuxt/**/*` (Nuxt резервує
цю директорію під `@nuxt/test-utils`), а `vitest.config.ts` бере лише
`tests/unit/**/*.test.ts`. Не дефект сьогодні; стане пасткою в день, коли
з'явиться перший компонентний тест: файл буде типізований, але не запущений.

**Рекомендація:** зафіксувати в плані компонентних тестів як перший крок.

## Залишкові ризики

- Браузерні потоки (`tests/e2e/*`) у цьому аудиті не виконувалися; вони й не
  в CI (ініціатива `ci-quality-gate`).
- Гілка `CATALOG_SOURCE=firebase` у handler-тестах покрита моками, а не
  реальним backend-ом; Supabase-гілка — так само.
- Прогін на Vitest 5.0.0, CI — на 4.1.11 до `chore(deps)`.

## Ремедіації, які бере ця сесія

1. VITEST-10: спільний `installNitroGlobals` + міграція 10 файлів.
2. VITEST-11: `restoreMocks: true`, прибрати 9 ручних `restoreAllMocks`,
   shuffle-перевірка.
3. VITEST-12: `include` з `tests/nuxt/**/*.test.ts` наперед (порожній glob
   нешкідливий).
4. VITEST-3/TS-6: `typecheck:tests` (TypeScript-план).

## Заблоковано / потребує рішення

- **VITEST-7** — коміт бампу Vitest 5 і доля `.nuxtrc`: дія власника.
- **VITEST-8, VITEST-9** — `@nuxt/test-utils`, `happy-dom`,
  `@vitest/coverage-v8`: нові залежності після `chore(deps)`.
