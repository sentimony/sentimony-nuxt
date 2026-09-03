# TypeScript Hardening Implementation Plan

> **For agentic workers:** Use subagent-driven-development or executing-plans to execute the plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Тести проходять typecheck у CI, зелені strictness-прапорці діють у Nuxt-програмах через `nuxt.config.ts`, невикористаний код і non-null assertions прибрано; `exactOptionalPropertyTypes` — окремою останньою задачею.

**Architecture:** Нова програма `tsconfig.tests.json` extends generated `.nuxt/tsconfig.app.json`; прапорці живуть у `typescript.tsConfig` (app) і `nitro.typescript.tsConfig` (server) у `nuxt.config.ts`, generated-файли не редагуються. Хелпер `installNitroGlobals`/`fakeEvent` із плану Vitest використовується тут для TS2554.

**Tech Stack:** Nuxt 4.5, TypeScript 6.0.3, `vue-tsc` 3.3.11, Vitest 5.0.0 (робоча копія), GitHub Actions.

**Спека:** [`docs/specs/2026-09-04-typescript-hardening-design.md`](../specs/2026-09-04-typescript-hardening-design.md)
**Аудит:** [`docs/audits/2026-09-04-typescript-audit.md`](../audits/2026-09-04-typescript-audit.md)

## Global Constraints

- Коментарі в коді, коміти — англійською; спілкування — українською.
- Не редагувати `.nuxt/tsconfig.*.json`; після зміни `nuxt.config.ts` — `npm run prepare:types` і перевірка згенерованих прапорців.
- Не «лікувати» діагностики через `any`, `as`, `@ts-ignore`; cast лише на межі мока в тестах.
- Файли закінчуються одним переносом рядка, 2 пробіли, без trailing whitespace.
- Гейт після кожної задачі: `npm run test:unit && npm run typecheck && npm run typecheck:tests && npm run docs:check`.
- Git: `git add` лише з переліком файлів; перед комітом — `git diff --cached --name-only`.

## Контекст для виконавця

- **Робоче дерево брудне навмисно:** `package.json`, `package-lock.json`, `public/_redirects`, `server/data/sentimony-db.yml` (modified) і `.nuxtrc` (untracked) — чужі зміни, **не стейджити, не комітити, не відкочувати**. Зміни скриптів у `package.json` (задача 1) стейджаться через `git add -p package.json` лише хунком зі скриптами; хунк із версіями залежностей лишається незастейдженим.
- Гілка `quality-audits-2026-09`. Коміт на задачу, локально, без push.
- Порядок планів сесії: цей → Vitest → Frontend. Задача 1 залежить від `tests/setup/nitroMocks.ts` (план Vitest, задача 1) — виконуються разом.
- `npm run typecheck:tests` без `pretypecheck:tests` вимагає наявного `.nuxt/`; після `npm run test:unit` він є.

---

## Задача 0. Precondition: закомітити документи сесії

**Files:** `docs/specs/2026-09-04-*.md`, `docs/plans/2026-09-04-*.md`, `docs/initiatives/catalog-semantics.md`, `docs/roadmap.md`

- [ ] `git diff --cached --name-only` порожній.
- [ ] `git add` шість документів + ініціатива + roadmap; `npm run docs:check`; commit `docs: add 2026-09-04 remediation specs, plans and the catalog-semantics initiative`.

---

## Задача 1. Тестова програма, скрипт, CI-крок, дев'ять правок

**Files:**
- Create: `tsconfig.tests.json`
- Modify: `package.json` (тільки `scripts`), `.github/workflows/ci.yml`
- Modify: `tests/unit/releasesApi.test.ts`, `tests/unit/perfStats.test.ts`, `tests/unit/perfRoutes.test.ts`, `tests/e2e/homepage-theme.spec.ts`
- Depends: `tests/setup/nitroMocks.ts` (план Vitest, задача 1)

- [ ] **Step 1:** створити `tsconfig.tests.json` зі спеки (extends `./.nuxt/tsconfig.app.json`, include `.nuxt/nuxt.d.ts`, `tests/**/*.ts`, `vitest.config.ts`, `playwright.config.ts`, `exclude: []`).
- [ ] **Step 2:** `package.json` → `"typecheck:tests": "node_modules/.bin/vue-tsc --noEmit -p tsconfig.tests.json"`, `"pretypecheck:tests": "npm run prepare:types"`. Запустити `npm run typecheck:tests` — очікується 9 діагностик (baseline аудиту).
- [ ] **Step 3:** `perfStats.test.ts`, `perfRoutes.test.ts` — прибрати рядок `// @ts-expect-error …`; у `perfStats` звузити `summarize()` (`expect(result).not.toBeNull()` + optional chaining, або окремий `it('returns null for no finite samples')`).
- [ ] **Step 4:** `homepage-theme.spec.ts:200,217` — `window as unknown as Window & { __viewTransitionCalls: number }`.
- [ ] **Step 5:** `releasesApi.test.ts:51,79` — `handler(fakeEvent())` з `../setup/nitroMocks`.
- [ ] **Step 6:** `ci.yml` job `typecheck` → третій крок `- name: Typecheck tests (vue-tsc, tests program)` / `run: npm run typecheck:tests`. Позначити в коміті, що крок не верифікований до пушу.
- [ ] **Step 7:** гейт; `git add tsconfig.tests.json .github/workflows/ci.yml tests/unit/releasesApi.test.ts tests/unit/perfStats.test.ts tests/unit/perfRoutes.test.ts tests/e2e/homepage-theme.spec.ts` + `git add -p package.json` (лише хунк скриптів); commit `feat(typecheck): type-check the test suite`.

---

## Задача 2. Зелені прапорці через `nuxt.config.ts`

**Files:** `nuxt.config.ts`

- [ ] **Step 1:** додати `typescript: { tsConfig: { compilerOptions: { noFallthroughCasesInSwitch: true } } }` і `nitro.typescript.tsConfig.compilerOptions = { noImplicitOverride: true, noFallthroughCasesInSwitch: true }`.
- [ ] **Step 2:** `npm run prepare:types`; `node -e` прочитати `.nuxt/tsconfig.app.json` і `.nuxt/tsconfig.server.json` — обидва прапорці `true`.
- [ ] **Step 3:** гейт; commit `chore(typescript): enable fallthrough and override checks in the Nuxt programs`.

---

## Задача 3. 19 невикористаних декларацій + `noUnused*`

**Files:** `app/layouts/default.vue`, `app/pages/index.vue`, `app/pages/tracks.vue`, 13 × `server/api/**/*.get.ts` з `const isDev`, `nuxt.config.ts`, будь-які тестові файли, що впадуть під `noUnused*`

- [ ] **Step 1:** прибрати `host` (`default.vue:5`), чотири константи `logoNewUrlv2/AltV2/UrlV3/AltV3` (`index.vue:6-9`), `friends` разом із `useFriends()`/`friendsRaw`/`friendsArr` і імпортом `Friend` (`tracks.vue`), 13 × `const isDev = …` (перевірити, що `isDev` ніде далі у файлі не читається).
- [ ] **Step 2:** `nuxt.config.ts` → `noUnusedLocals: true, noUnusedParameters: true` в обох `compilerOptions`.
- [ ] **Step 3:** `npm run prepare:types && npm run typecheck && npm run typecheck:tests` — виправити все, що з'явиться в тестах (невикористані імпорти/змінні), без супресій.
- [ ] **Step 4:** гейт; commit `chore(typescript): drop unused declarations and enforce noUnused checks` з тілом про мінус один SSR-запит `useFriends` на `/tracks`.

---

## Задача 4. 13 non-null assertions → guard-и

**Files:** `app/pages/track/[id].vue:30-32,64`, `server/utils/firebaseCatalog.ts:66,70,71,83`, `server/api/track/[id].get.ts:29,30`, `app/utils/sanitizeHtml.ts:70`, `app/utils/tracks.ts:68`, `app/components/player/GlobalPlayer.vue:36`

- [ ] **Step 1:** сторінка треку — після throw-guard `const payload = data.value` (тип звужений), computed-и читають `payload.track` тощо; `split(',')[0]!.trim()` → `split(',')[0]?.trim()` з `?? undefined`-гілкою.
- [ ] **Step 2:** `firebaseCatalog.ts` — capture groups через `?.[1] ?? ''`; `sanitizeHtml.ts:70` — так само; `tracks.ts:68` — `slugs[index] ?? null`.
- [ ] **Step 3:** `track/[id].get.ts:29,30` — `const [release] = releases; if (!release) …` (з тим самим early return, що і для порожнього масиву); `GlobalPlayer.vue:36` — `const [first] = queue; if (!first) return`.
- [ ] **Step 4:** `grep -rnE '[A-Za-z0-9_)\]]!(\.|\[|\)|,|;| |$)' app server netlify --include='*.ts' --include='*.vue' | grep -v '!=' | grep -v 'class='` → 0.
- [ ] **Step 5:** гейт; commit `refactor(typescript): replace non-null assertions with guards`.

---

## Задача 5. AGENTS.md: новий гейт

**Files:** `AGENTS.md`

- [ ] **Step 1:** рядок **check** і абзац «Commands» → `npm run test:unit && npm run typecheck && npm run typecheck:tests && npm run docs:check`; речення про `tsconfig.tests.json` (extends generated app-програму, `exclude: []`, без Vitest-globals). `Last reviewed: 2026-09-04`. Під 250 рядків.
- [ ] **Step 2:** `docs/initiatives/typescript-hardening.md` — обсяг: `typecheck:tests` ✓, зелені прапорці ✓, unused ✓, non-null ✓; лишаються `exactOptionalPropertyTypes` (якщо задача 6 не виконана) і ESLint; `Last reviewed: 2026-09-04`; статус `Partial` (roadmap уже `Partial`).
- [ ] **Step 3:** `npm run docs:check`; commit `docs: record the test typecheck gate in AGENTS.md`.

---

## Задача 6 (остання, відкладувана). `exactOptionalPropertyTypes` — 37 правок

**Files:** 20 місць передавання `undefined` в optional prop (`OpenImage` ×5 сторінок, `EntityLinks` ×3, `PlayerTrackInfo` ×2, `Item` у `Swiper` ×2, `Tab`, `Tabs`, `AuthForm`, `DefaultButton` в `OpenImage`, `AudioMixPlayer`, `PagePlayer` ×3); 7 reka-ui обгорток `ui/{input,label,sonner,tooltip/*}`; 10 об'єктів (`QueueItem`/`PlayerItem` у `useAudioPlayer`, `GlobalPlayer`, `PagePlayer`; `sitemapUrls.ts` ×2; `news.vue` ×2; `artist`, `release`, `track` playerTracks)

- [ ] **Step 1:** прапорець у обох `compilerOptions`; `prepare:types`; зафіксувати список діагностик (очікується 37 + можливі в тестах).
- [ ] **Step 2:** для компонентів, що навмисно приймають `undefined`, — `x?: T | undefined` у `defineProps`; для об'єктів — `| undefined` у типі поля або пропуск ключа через spread умовно.
- [ ] **Step 3:** гейт; commit `chore(typescript): enable exactOptionalPropertyTypes`. Якщо задача не завершена в сесії — **відкотити прапорець і правки** (`git checkout -- .` по allowlist задачі), лишити цей блок без галочок і зафіксувати в ініціативі число 37.
