# Vitest Hygiene Implementation Plan

> **For agentic workers:** Use subagent-driven-development or executing-plans to execute the plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Handler-тести ставлять Nitro-глобали через один типізований хелпер із власним `restore()`, reset моків централізовано в конфізі, `include` готовий до `tests/nuxt/**`.

**Architecture:** `tests/setup/nitroMocks.ts` експортує `installNitroGlobals(overrides)` → `restore` і `fakeEvent()`; не в `setupFiles` — глобали ставлять лише тести, які їх просять. `restoreMocks: true` у `vitest.config.ts` замінює дев'ять ручних `vi.restoreAllMocks()`.

**Tech Stack:** Vitest 5.0.0 (робоча копія; коміт — 4.1.11, обидва підтримують `restoreMocks`), `environment: node`.

**Спека:** [`docs/specs/2026-09-04-vitest-hygiene-design.md`](../specs/2026-09-04-vitest-hygiene-design.md)
**Аудит:** [`docs/audits/2026-09-04-vitest-audit.md`](../audits/2026-09-04-vitest-audit.md)

## Global Constraints

- Ті самі, що в плані TypeScript; гейт після кожної задачі:
  `npm run test:unit && npm run typecheck && npm run typecheck:tests && npm run docs:check`.
- Після кожної задачі додатково: `node_modules/.bin/vitest run --sequence.shuffle --sequence.seed=20260904` — зелений.
- Не змінювати `isolate`; не додавати залежностей.

## Контекст для виконавця

- Сім файлів із Nitro-глобалами: `artistPageApi`, `releasesApi`, `likeCountersHandler`, `catalogTracks`, `trackArtistsUtils`, `firebaseCatalog`, `sitemapEndpoint`. Ще три згадують `globalThis` з інших причин (`fetch`-стаби) — їх не мігрувати.
- `releasesApi.test.ts` після міграції викликає `handler(fakeEvent())` (закриває TS2554 із плану TypeScript).
- Файл із `vi.mock` (один) не чіпати `mockReset`/`clearMocks`.

---

## Задача 1. Хелпер `installNitroGlobals` + міграція семи файлів

**Files:**
- Create: `tests/setup/nitroMocks.ts`
- Modify: сім тестових файлів вище
- Test: `tests/unit/nitroMocks.test.ts` (create) — `installNitroGlobals` ставить дефолти й overrides, `restore()` повертає попередні значення і видаляє нові ключі

- [ ] **Step 1:** створити хелпер за спекою (дефолти `defineEventHandler`, `defineCachedEventHandler`, `catalogCacheOptions`, `createError`; `fakeEvent`).
- [ ] **Step 2:** написати `nitroMocks.test.ts` (3 кейси) — падає до створення хелпера, проходить після.
- [ ] **Step 3:** мігрувати файли по одному: `beforeEach` → `restore = installNitroGlobals({...overrides файлу})`; `afterEach` → `restore()`; прибрати ручні `delete (globalThis…)[key]`. `vi.resetModules()` лишити. Кожен файл — окремий `npx vitest run tests/unit/<file>`.
- [ ] **Step 4:** гейт + shuffle; commit `test: share Nitro auto-import mocks through installNitroGlobals`.

---

## Задача 2. `restoreMocks: true`

**Files:** `vitest.config.ts`, 9 файлів із `vi.restoreAllMocks()`

- [ ] **Step 1:** `test.restoreMocks: true`.
- [ ] **Step 2:** видалити `vi.restoreAllMocks()` у 9 файлах; порожні `afterEach` видалити, непорожні лишити (там `restore()` хелпера).
- [ ] **Step 3:** гейт + shuffle; commit `test: restore mocks from the Vitest config instead of per-file hooks`.

---

## Задача 3. `include` для `tests/nuxt/**`

**Files:** `vitest.config.ts`

- [ ] **Step 1:** `include: ['tests/unit/**/*.test.ts', 'tests/nuxt/**/*.test.ts']`.
- [ ] **Step 2:** `npm run test:unit` — 52 + 1 (nitroMocks) файли, як і до зміни; commit `test: include the reserved tests/nuxt directory`.

---

## Задача 4. AGENTS.md та ініціатива

**Files:** `AGENTS.md`, `docs/initiatives/component-testing-and-coverage.md`

- [ ] **Step 1:** у AGENTS.md абзац про моки Nitro auto-imports → посилання на `installNitroGlobals` у `tests/setup/nitroMocks.ts` замість «assigning them to globalThis … see likeCountersHandler.test.ts»; речення про `restoreMocks: true` (ручний `vi.restoreAllMocks` не потрібен) і про пораду Vitest 5 `isolate: false` (не застосовувати — тести мутують `globalThis`).
- [ ] **Step 2:** ініціатива: обсяг «скоротити manual globalThis mocks» і «cleanup policy» — виконано; лишаються harness, coverage (заблоковані `chore(deps)`); `Last reviewed: 2026-09-04`; статус лишається `Planned`.
- [ ] **Step 3:** `npm run docs:check`; commit `docs: describe the shared Nitro mock helper and restoreMocks policy`.
