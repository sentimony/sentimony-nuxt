# Project Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Послідовно реалізувати вісім підтверджених оптимізацій безпеки, bundle size, API та тестової інфраструктури.

**Architecture:** Винести правила безпеки й трансформації даних у тестовані helpers, після чого підключити їх до Nuxt config, API та UI. Зберегти існуючі публічні контракти, крім нового агрегованого profile endpoint.

**Tech Stack:** Nuxt 4, Nitro/H3, Supabase, Firebase Realtime Database, Vue 3, Vitest, Playwright, DOMPurify.

---

### Task 1: Cache policy

**Files:**
- Create: `server/utils/cachePolicy.ts`
- Test: `tests/unit/cachePolicy.test.ts`
- Modify: `nuxt.config.ts`

- [ ] Написати failing unit tests для public catalog, public like-count і private likes routes.
- [ ] Реалізувати route classification constants і підключити точкові `routeRules`.
- [ ] Перевірити Vitest і production config output.

### Task 2: Visibility and HTML security

**Files:**
- Create: `app/utils/sanitizeHtml.ts`
- Test: `tests/unit/sanitizeHtml.test.ts`
- Modify: `server/api/{release,artist,event,friend,playlist,video}/[id].get.ts`
- Modify: Vue files із динамічним database HTML.

- [ ] Написати failing sanitizer tests для `script`, event handlers і `javascript:` URLs.
- [ ] Встановити `isomorphic-dompurify` та реалізувати спільний sanitizer.
- [ ] Додати `.eq('visible', true)` для Supabase detail queries і Firebase visibility guard.
- [ ] Замінити небезпечні database-backed `v-html` bindings на sanitized computed values.

### Task 3: Private database export

**Files:**
- Move: `public/data/sentimony-db-export.json` → `server/data/sentimony-db-export.json`
- Modify: `package.json`
- Modify: `scripts/sync-supabase.mjs`
- Modify: `scripts/migrate-tracks.mjs`
- Modify: `README.md`
- Modify: `CLAUDE.md`

- [ ] Перемістити export через filesystem move без зміни JSON.
- [ ] Оновити всі scripts і документацію.
- [ ] Перевірити відсутність export у generated public output.

### Task 4: Icon bundle

**Files:**
- Modify: `nuxt.config.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: icon usages з `fa7-solid` та `ic`.

- [ ] Замінити сторонні dynamic prefixes на Lucide.
- [ ] Видалити `@iconify-json/tabler`.
- [ ] Налаштувати `icon.serverBundle.collections` для `lucide` і `simple-icons`.
- [ ] Зібрати production bundle і перевірити відсутність Carbon/Tabler chunks.

### Task 5: Conditional Swiper

**Files:**
- Modify: `app/layouts/default.vue`
- Test: `tests/e2e/layout-loading.spec.ts`

- [ ] Написати failing E2E assertion, що неактивні carousel DOM-вузли відсутні.
- [ ] Замінити CSS hiding на `v-if` і `LazySwiper`.
- [ ] Перевірити homepage та detail routes.

### Task 6: Test infrastructure

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/unit/*.test.ts`
- Create: `tests/e2e/api-security.spec.ts`
- Modify: `package.json`
- Modify: `playwright.config.ts`
- Replace: `app/types/database.types.ts`

- [ ] Додати Vitest scripts і node test environment.
- [ ] Перевести Playwright base URL і web server URL на `localhost`.
- [ ] Додати API/security regression tests.
- [ ] Згенерувати Supabase Database types через локальну schema dump або описати фактично використані таблиці, якщо CLI schema недоступна.

### Task 7: Aggregated profile loading

**Files:**
- Create: `server/api/profile-likes.get.ts`
- Create: `server/utils/profileLikes.ts`
- Test: `tests/unit/profileLikes.test.ts`
- Modify: `app/composables/usePaginatedLikes.ts`
- Modify: `app/pages/profile.vue`

- [ ] Написати failing tests для агрегування шести category loaders.
- [ ] Реалізувати серверний parallel aggregator.
- [ ] Додати initial data support у pagination composable.
- [ ] Перевести profile на один початковий HTTP request.

### Task 8: Firebase visibility filtering

**Files:**
- Modify: `server/utils/pickListFields.ts`
- Test: `tests/unit/pickListFields.test.ts`
- Modify: Firebase list endpoint calls.

- [ ] Написати failing test, що `visible: false` записи відкидаються.
- [ ] Додати `visibleOnly` option і ввімкнути його в catalog lists.
- [ ] Перевірити DTO shape і сортування.

### Task 9: Full verification

- [ ] Запустити `npm run test:unit`.
- [ ] Запустити `npx nuxt typecheck`.
- [ ] Запустити Playwright API/security і homepage suites.
- [ ] Запустити `npm run build`.
- [ ] Порівняти client chunks, Nitro total і icon chunks з baseline.
- [ ] Перевірити `git diff` та збереження початкових UI-змін користувача.
