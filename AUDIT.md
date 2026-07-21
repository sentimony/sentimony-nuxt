# Аудит якості Sentimony Nuxt

- Дата: 2026-07-19
- Гілка: `main`
- Формат: read-only аудит; код і конфігурацію не змінено.

## Резюме

TypeScript-стан основного застосунку та Netlify Edge Functions зелений у штатних перевірках. Базова конфігурація сувора, обидва компілятори закріплені lockfile і запускаються в CI. Браузерний smoke показав стабільний SSR усіх перевірених маршрутів, але виявив витік прихованого Supabase-запису, зламаний footer asset на всіх сторінках і відсутність browser E2E у CI. Основні TypeScript-ризики — відсутність статичної перевірки тестових файлів та розрив між базовим і реально згенерованими Nuxt-конфігами.

## 1. TypeScript

### Обсяг і методика

Перевірено:

- `package.json`, `package-lock.json`, `.nvmrc`;
- `tsconfig.json`, `tsconfig.base.json`, `netlify/tsconfig.json`;
- згенеровані `.nuxt/tsconfig.{app,server,shared,node}.json`;
- CI workflow `.github/workflows/web-debug.yml`;
- 140 TypeScript/Vue-файлів у `app`, 82 у `server`, 4 у `netlify`, 43 у `tests`;
- використання `any`, suppression-директив і non-null assertions;
- фактичний результат TypeScript 6/Nuxt та TypeScript 7 native;
- пробне ввімкнення відсутніх strictness/hygiene-прапорців без зміни конфігурації.

Виконані команди:

```bash
python .agents/skills/typescript/scripts/inspect_typescript.py --root .
npm run typecheck
npm run typecheck:ts7
npx vue-tsc --noEmit -p .nuxt/tsconfig.app.json --noFallthroughCasesInSwitch
npx vue-tsc --noEmit -p .nuxt/tsconfig.app.json --exactOptionalPropertyTypes
npx vue-tsc --noEmit -p .nuxt/tsconfig.app.json --noUnusedLocals --noUnusedParameters
npx tsc --noEmit -p .nuxt/tsconfig.server.json --noImplicitOverride --noFallthroughCasesInSwitch
```

### Що працює добре

- `npm run typecheck` проходить через Nuxt/Vue checker і перевіряє `.vue`, а не лише `.ts`.
- `npm run typecheck:ts7` проходить для `netlify/edge-functions/**/*.ts`.
- CI запускає обидва typecheck-контури до unit tests і build.
- Встановлені версії однозначно зафіксовані `package-lock.json`: TypeScript `6.0.3`, `@typescript/native` `7.0.2`, `vue-tsc` `3.3.7`.
- Node зафіксований у `.nvmrc` як `24.15.0` і узгоджений з `package.json#engines`.
- Для Netlify діють `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `module: ESNext` та `moduleResolution: Bundler`.
- У production-коді не знайдено `: any`, `as any`, `@ts-ignore` або `@ts-expect-error`.
- Пробні `noFallthroughCasesInSwitch` для Nuxt та `noImplicitOverride` для server-контуру проходять без помилок, тобто їх можна ввімкнути з низьким ризиком.

### Знахідки

#### TS-1 — Important: тести не мають статичного typecheck-контуру

`tsconfig.json` посилається лише на згенеровані Nuxt-проєкти. Вони охоплюють `app`, `server`, `shared` і Nuxt config, але не `tests/unit/**/*.ts`, `tests/e2e/**/*.ts`, `tests/setup/**/*.ts`, `vitest.config.ts` та `playwright.config.ts`. Усього поза статичною перевіркою лишаються 42 spec-файли та тестова setup-конфігурація.

Vitest і Playwright транспілюють TypeScript, але не замінюють `tsc`/`vue-tsc`: невірні mock-сигнатури, типи fixtures або imports можуть пройти локально й у CI.

Рекомендація:

1. Додати окремий `tsconfig.tests.json` з відповідними `types` для Vitest, Node і Playwright та з aliases, узгодженими з Nuxt/Vitest.
2. Додати `typecheck:tests` і запустити його в CI.
3. Не включати тестові globals у production-конфіги.

#### TS-2 — Important: `tsconfig.base.json` не визначає суворість Nuxt-застосунку

`tsconfig.base.json` містить `exactOptionalPropertyTypes`, `noFallthroughCasesInSwitch` і `noImplicitOverride`, однак кореневий `tsconfig.json` його не наслідує: він складається з Nuxt project references. Фактичні згенеровані Nuxt-конфіги мають `strict` і `noUncheckedIndexedAccess`, але:

- усі Nuxt-контури не мають `exactOptionalPropertyTypes`;
- усі Nuxt-контури не мають `noFallthroughCasesInSwitch`;
- server-контур не має `noImplicitOverride`.

Це створює хибне враження, що весь проєкт уже перевіряється з прапорцями базового config.

Пробна перевірка показала:

- `noFallthroughCasesInSwitch` проходить без помилок;
- `noImplicitOverride` для server-контуру проходить без помилок;
- `exactOptionalPropertyTypes` виявляє 28 діагностик у компонентах, composables, сторінках і sitemap utility. Переважає передавання `undefined` у формально optional props замість пропуску властивості.

Рекомендація: переносити Nuxt-specific compiler options через `typescript.tsConfig.compilerOptions` у `nuxt.config.ts`, вмикаючи по одному прапорцю. Спершу — два зелені прапорці, окремим етапом — `exactOptionalPropertyTypes` із виправленням усіх 28 місць.

#### TS-3 — Moderate: `noUnusedLocals`/`noUnusedParameters` виявляють 19 невикористаних декларацій

Пробний запуск знайшов:

- 6 невикористаних змінних у Vue-коді;
- 13 невикористаних `isDev` у server handlers.

Це не runtime-помилки, але зайвий код маскує незавершені refactors та знижує сигнал компілятора.

Рекомендація: очистити 19 декларацій, після чого ввімкнути `noUnusedLocals` і `noUnusedParameters` у Nuxt-конфігурації.

#### TS-4 — Minor: production-код містить 17 non-null assertions

Основні групи:

- п’ять `data.value!` у `app/pages/track/[id].vue`, де narrowing до computed closure не зберігається;
- доступи до regex capture groups та `match.index`;
- доступи до першого елемента масиву або індексу після логічної перевірки довжини.

Частина assertions логічно обґрунтована, але компілятор більше не захищає ці місця від майбутніх змін control flow.

Рекомендація: у сторінці треку зберегти перевірене значення в локальну константу перед створенням computed; для regex/масивів використовувати guard або fallback. Не замінювати assertions на широкі casts.

#### TS-5 — Minor: немає лінтера для запобігання регресіям типів

Інспектор не виявив ESLint або іншого linter-контуру. Поточна відсутність explicit `any` і suppression-директив позитивна, але не захищена автоматично.

Рекомендація: окремо запланувати ESLint для Vue/Nuxt із правилами проти explicit `any`, `@ts-ignore` і небезпечних non-null assertions. Це доповнює, а не замінює typecheck.

### Пріоритет TypeScript-дій

1. Додати `typecheck:tests` і CI-крок.
2. Увімкнути зелені `noFallthroughCasesInSwitch` та `noImplicitOverride` через Nuxt config.
3. Очистити unused declarations і ввімкнути unused checks.
4. Окремим PR довести application-код до `exactOptionalPropertyTypes`.
5. Поступово прибрати production non-null assertions та додати lint guardrails.

## 2. Web-debug

### Обсяг і методика

Аудит виконано нативним Python Playwright у headless Chromium проти вже запущеного локального Nuxt на `http://localhost:3000`. Write-сценарії не виконувалися.

Перевірено:

- 14 статичних і 7 динамічних маршрутів;
- desktop `1440×900` і mobile `412×915`, разом 42 окремі page loads;
- 7 catalog API для визначення реальних dynamic slugs;
- HTTP status, console warnings/errors, page errors, request failures;
- title, canonical, `lang`, `<h1>`, `<main>`, broken images;
- theme toggle, persistence після reload та SPA-навігація після hydration;
- повний наявний Playwright suite у двох проєктах;
- повторний прогін нестабільного mobile-тесту;
- проблемний зовнішній asset через прямий HTTP-запит.

Ключові команди:

```bash
BASE_URL=http://localhost:3000 python /tmp/sentimony_web_audit.py
BASE_URL=http://localhost:3000 python /tmp/sentimony_web_confirm.py
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test \
  tests/e2e/homepage-theme.spec.ts \
  --project=mobile-chromium \
  -g 'does not fetch the forest asset during first paint' \
  --repeat-each=2
```

### Фактичний результат

- Усі 7 discovery API повернули `200`.
- Усі 42 desktop/mobile page loads повернули `200`, мали непорожній title, `lang="en"` і видимий контент.
- Не зафіксовано uncaught page errors, console errors або page-level HTTP 4xx/5xx.
- Усі public routes, крім навмисно noindex `/signin`, мають canonical.
- Theme toggle змінює тему, записує `theme=light` і зберігає стан після reload.
- SPA-перехід `/` → `/releases` після hydration оновлює URL, title, `<h1>` і контент.
- Скриншоти desktop/mobile не показали горизонтального overflow або критичного layout collapse.
- Повний Playwright suite: 29 із 32 тестів пройшли; три падіння описані нижче.

### Знахідки

#### WEB-1 — Important: Supabase detail API віддає прихованого артиста

`GET /api/artist/harax` повертає `200` і повний запис із `"visible": false`. Інші чотири hidden-record probes повертають `404`.

Причина видима у `server/api/artist/[id].get.ts`: handler повертає знайдений запис без `isPublicEntity()`/перевірки `visible`. Це порушує задокументовану модель public catalog API і дозволяє обійти фільтр list endpoint прямим slug-запитом.

Наявний `tests/e2e/api-security.spec.ts` виявляє помилку в обох Playwright projects, але CI задає `NUXT_CATALOG_SOURCE=firebase`, тоді як production/stage за project docs працюють із Supabase. Отже, production backend path не захищений CI.

Рекомендація:

1. Застосувати єдину `isPublicEntity()`-перевірку в artist detail handler для обох backends.
2. Додати unit regression test окремо для Supabase і Firebase.
3. Запускати security E2E для обох `CATALOG_SOURCE`, щонайменше detail visibility probes.

#### WEB-2 — Important: footer SVG зламаний на кожній сторінці

У всіх 42 page loads Chromium зафіксував:

```text
net::ERR_BLOCKED_BY_ORB
https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.3%20.svg?01
```

Прямий HTTP-запит підтверджує `404` і `content-type: text/html`; URL без `%20` повертає `200 image/svg+xml`. У поточному `app/components/Footer.vue` перед `.svg` є зайвий пробіл. На desktop і mobile full-page screenshots у footer видно broken-image marker.

Рекомендація: прибрати пробіл із URL і додати browser assertion, що всі видимі `img` мають `naturalWidth > 0`.

#### WEB-3 — Important: browser E2E не є CI quality gate

`.github/workflows/web-debug.yml` запускає typecheck, unit tests, build і `npm run web-debug`, але не `npm run test:e2e`. Сам `scripts/web-debug.mjs` перевіряє лише HTTP status через Node `fetch`: він не запускає браузер, не бачить hydration, console/page errors, broken assets або взаємодії.

Workflow також прямо зазначає, що `node-server` preset не відтворює Netlify CJS lambda module resolution. Таким чином, назва `web-debug` створює ширше очікування покриття, ніж фактично дає job.

Рекомендація:

1. Додати окремий Playwright CI job після build/unit gates.
2. Залишити `scripts/web-debug.mjs` як швидкий SSR route smoke, але назвати й документувати його саме так.
3. Додати Netlify-preset smoke для відомого ESM/CJS ризику або smoke deployed preview.

#### WEB-4 — Moderate: public layout не має `<main>`, homepage не має `<h1>`

Усі 42 перевірені public renders мають `mainCount = 0`; homepage додатково має `h1Count = 0`. Решта list/detail routes мають по одному `<h1>`.

Це погіршує landmark navigation для screen reader users і семантичну структуру homepage.

Рекомендація: замінити layout wrapper навколо page slot на `<main>` та дати homepage один змістовний `<h1>`; візуальний дизайн можна зберегти без змін.

#### WEB-5 — Moderate: mobile first-paint тест має race

Тест `does not fetch the forest asset during first paint` пройшов у desktop, але впав у mobile під час повного suite і повторно 2 із 2 разів в isolated mobile run. На момент assertion `--forest-bg` ще порожній, але request до asset уже стартував.

Plugin навмисно планує preload через `requestIdleCallback` після `load`; на швидкому mobile context idle callback може виконатися між `page.goto()` і assertion. Тому тест змішує дві події — початок request і застосування background — та залежить від scheduler timing.

Рекомендація: інструментувати resource/paint timing через init script і порівнювати asset request із first paint, або тестувати чіткий DOM/state contract. Не покладатися на те, що assertion виконається раніше за idle callback.

#### WEB-6 — Minor: route smoke не охоплює track detail і частину auth routes

`scripts/web-debug.mjs` перевіряє `/tracks`, але не резолвить `/api/tracks` → `/track/:slug`. Також smoke має лише `/signin`, без signup/password/confirm flows. Саме track detail містить складну hydration/fallback логіку й вартий окремого probe.

Рекомендація: додати dynamic track route та хоча б SSR probes решти public auth screens.

### Пріоритет web-debug дій

1. Закрити hidden artist exposure і додати dual-backend regression coverage.
2. Виправити footer SVG.
3. Додати реальний Playwright job у CI.
4. Додати `<main>` та homepage `<h1>`.
5. Стабілізувати first-paint тест і розширити route smoke.

## 3. Vitest

### Обсяг і методика

Перевірено `vitest.config.ts`, setup file, усі 39 unit test files, test scripts, CI wiring, залежності для coverage/DOM testing, mock/global cleanup, focused/skipped tests, timers, snapshots і source-reading patterns.

Виконані команди:

```bash
python .agents/skills/vitest/scripts/inspect_vitest.py --root .
npm run test:unit
npm run test:unit -- \
  --sequence.shuffle \
  --sequence.seed=20260719 \
  --detectAsyncLeaks
```

### Фактичний результат

- Звичайний прогін: 39/39 files, 161/161 tests, `729ms`.
- Shuffled прогін із seed `20260719`: 39/39 files, 161/161 tests, `1.72s`.
- Async resource leaks не виявлено.
- Немає `.only`, `.skip`, `.todo`, snapshots або sleep-based unit tests.
- `include: ['tests/unit/**/*.test.ts']` коректно відділяє unit suite від Playwright specs і skill examples.
- `environment: 'node'` відповідає більшості pure/server utilities.
- Дев’ять файлів тимчасово змінюють `globalThis`; вони використовують file isolation і переважно мають явний cleanup через `afterEach`.
- Baseline у `AGENTS.md` і `ROADMAP.md` актуальний: 39 files / 161 tests.

### Знахідки

#### VITEST-1 — Important: unit-тест закріплює hidden-record exposure

`tests/unit/artistPageApi.test.ts` має тест:

```text
returns hidden artists by direct slug route
```

Він очікує успішну відповідь із `visible: false`. Це прямо суперечить:

- `tests/e2e/api-security.spec.ts`, який очікує `404`;
- unit tests для `isPublicEntity`;
- sitemap/list tests, які виключають hidden entities;
- задокументованій public catalog моделі.

Через відсутність Playwright job у CI unit suite зелений і фактично захищає дефект WEB-1 від виправлення.

Рекомендація: інвертувати unit contract — окремо для Firebase і Supabase очікувати `404` на hidden artist. Спочатку виправити handler, потім замінити поточний тест regression-тестами правильної поведінки.

#### VITEST-2 — Important: component behavior майже не тестується у Vitest

Проєкт не має `@nuxt/test-utils`, `@vue/test-utils`, `happy-dom` або `jsdom`; єдиний Vitest project працює в `node`. Тринадцять із 39 test files читають `.vue`/config source через `readFileSync`; у цих файлах розташовано 54 із 151 явно оголошених test cases.

Такі перевірки корисні як легкі structural contracts, але assertions на кшталт `source.toContain(...)` не доводять:

- що компонент монтується;
- що props/events працюють;
- що computed state оновлює DOM;
- що auto-imports/plugins доступні;
- що accessibility name і focus behavior правильні;
- що шаблон не падає під час hydration.

Вони також можуть впасти від безпечного форматування/refactor або пройти при runtime-дефекті.

Рекомендація:

1. Залишити `node` project для pure/server tests.
2. Додати окремий Nuxt/Vue component project із відповідним DOM environment.
3. Поступово замінювати найцінніші source-string assertions поведінковими тестами; почати з likes, audio player, auth form і tabs.
4. Structural source checks лишати тільки там, де сам текст/конфіг є контрактом.

#### VITEST-3 — Important: unit/test TypeScript не перевіряється статично

Vitest успішно транспілює 39 unit files, але не type-checks їх. `vitest.config.ts` не має typecheck project, а CI не має окремого test tsconfig. Це той самий coverage gap, що описаний у TS-1.

Рекомендація: додати окремий `tsconfig.tests.json` і `typecheck:tests` у CI. Не змішувати Vitest globals/types із production Nuxt configs.

#### VITEST-4 — Moderate: немає coverage provider, report або threshold

Не встановлено `@vitest/coverage-v8`/`@vitest/coverage-istanbul`; у config і CI немає coverage report чи thresholds. Число 161 не показує, які production branches реально виконуються. WEB-1 демонструє цю проблему: для helper `isPublicEntity` тести є, але critical integration branch має неправильний contract.

Рекомендація:

1. Додати V8 coverage для `app/**/*.{ts,vue}` і `server/**/*.ts`, виключивши generated/data/types.
2. Спершу зібрати baseline без жорсткого глобального порога.
3. Додати branch thresholds для security/data-visibility, likes, cache policy та sync transformations.
4. Не використовувати високий aggregate percentage як заміну risk-based tests.

#### VITEST-5 — Moderate: handler tests залежать від ручних global auto-import mocks

Дев’ять test files встановлюють Nuxt/Nitro auto-imports безпосередньо на `globalThis` і часто роблять `vi.resetModules()` перед dynamic import. Поточний cleanup якісний, а shuffled/async-leak прогін зелений, але цей pattern:

- легко зламати новим global без cleanup;
- не відтворює повний Nuxt/Nitro runtime;
- вимагає casts на межах handler types;
- робить тести чутливими до внутрішнього способу імпорту.

Рекомендація: для чистих handlers поступово вводити явні dependency seams/factories; для справді Nuxt-specific behavior використовувати Nuxt test utilities. До міграції тримати список globals централізованим і зберігати `afterEach` cleanup.

#### VITEST-6 — Minor: mock reset policy не задана централізовано

У config немає `restoreMocks`, `clearMocks` або `mockReset`. Поточні spy/global-heavy файли очищаються явно, і аудит не виявив leakage, тому це не поточний дефект. Ризик виникне при додаванні нових mocks.

Рекомендація: або задокументувати explicit cleanup як проєктний convention, або після пробного прогону ввімкнути найменш руйнівний централізований `restoreMocks`. Не вмикати всі reset-прапорці одночасно без перевірки module mocks.

### Пріоритет Vitest-дій

1. Замінити hidden-artist unit contract на dual-backend `404` regression tests.
2. Додати test typecheck до CI.
3. Додати окремий component-test project і мігрувати high-risk source assertions.
4. Додати coverage baseline та risk-based branch thresholds.
5. Формалізувати mock/global cleanup convention.

## 4. Зведений порядок виправлень

1. **Data visibility:** виправити hidden artist detail API; синхронізувати unit та E2E contracts для Firebase/Supabase.
2. **CI gates:** додати `typecheck:tests` і Playwright job; не обмежувати production-path перевірки Firebase mode.
3. **Broken UI asset:** виправити footer SVG URL і додати browser broken-image assertion.
4. **Type hardening:** увімкнути зелені Nuxt strictness flags, прибрати unused declarations, окремо мігрувати `exactOptionalPropertyTypes`.
5. **Test depth:** додати Nuxt/Vue component project і coverage baseline.
6. **Accessibility:** додати `<main>` для public layout і `<h1>` на homepage.
7. **Reliability:** стабілізувати mobile first-paint test і розширити route smoke.

## Обмеження аудиту

- Аудит не змінював код, конфігурацію, remote data або deployment state.
- Browser run використовував поточний локальний dev server і поточне незакомічене робоче дерево.
- Не перевірялися authenticated profile mutations, likes/claps або sync scripts, бо вони можуть писати у remote stores.
- Coverage не збирався, оскільки provider у проєкті не встановлений.
