# Playwright E2E Smoke Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Покрити два критичні user-flow Playwright E2E-смоками: (1) login + like-cycle release (auth → click ❤ → reload → like ще присутній → cleanup); (2) mobile menu open/close (hamburger toggle + Esc + backdrop + ARIA + body scroll-lock). Це smoke-рівень, що захищає від інтеграційних регресій між Nuxt SSR ↔ Supabase auth ↔ likes API.

**Architecture:** Стандартний `@playwright/test` (не `@nuxt/test-utils/playwright`-обгортка) — більш звичний DX, легше CI-debug. Запускаємо проти `nuxt dev` локально (через `webServer` Playwright config) і `nuxt preview` (build) у CI. Тестовий Supabase-user створюється у `globalSetup` через service-role API, видаляється у `globalTeardown`. Critical-slug релізу береться з env-var `E2E_TEST_RELEASE_SLUG` — тест skip-ається з warning якщо не задано (запобігає падінням у dev-environment без сід-данних).

**Tech Stack:** Playwright 1.x · Node 24 · Nuxt 4 dev-server · Supabase service-role API · TypeScript · GitHub Actions (для CI hint).

---

## Context для виконавця

**Передумова:** Плани 1-3 виконано (Vitest unit + server + component тести, 35 тестів зеленіють через `npm test`). `package.json` містить `test`/`test:watch`. План `2026-05-02-test-environments` виконано — `.env.stage` (default для Playwright) і `.env.prod` (escape hatch) існують і містять `NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_KEY`, `NUXT_SUPABASE_SECRET_KEY`. `.env.stage` вказує на `supabase-stage` проєкт.

**Чому Playwright, а не Cypress/Selenium:**
- Playwright швидший і має кращу інтеграцію з Nuxt (підтримує component-tests, network mocking, traces).
- Native TypeScript без додаткового config-у.
- `test.use({ viewport })` per-test без додаткового project — спрощує mobile-тест.

**Чому стандартний Playwright, а не `@nuxt/test-utils/playwright`:**
- Менше «магії» для CI debugging.
- Гнучкіший контроль над webServer (можна swap-нути на `nuxt preview` у CI).
- `@nuxt/test-utils/playwright` орієнтується на Vitest fixture API — це додатковий шар поверх Playwright, що ускладнює помилки.

**Test data стратегія:**
1. **User** — створюємо у `globalSetup` через service-role `supabase.auth.admin.createUser({ email_confirm: true })`. Email унікальний per-run (`playwright-${Date.now()}@test.local`). Видаляємо у `globalTeardown` через `auth.admin.deleteUser(id)`.
2. **Release slug** — НЕ створюємо в БД. Беремо з env-var `E2E_TEST_RELEASE_SLUG` (треба, щоб ця row була `visible=true` у Supabase/Firebase). Якщо env-var не задано — `test.skip()` з warning. Альтернативу (створення тестового release row) додамо у roadmap, бо потребує знання `releases` schema.
3. **`release_likes` cleanup** — після кожного like-тесту, у `afterEach` робимо DELETE через service-role: `delete from release_likes where user_id = ?`. Це підстраховка на випадок, якщо тест впав посеред cycle і не зміг сам почистити.

**Безпека production-даних:**
- `.env.stage` гарантовано вказує на `supabase-stage` (див. spec `2026-05-02-test-environments-design.md`). Test-user створюється там, не у проді.
- У CI використовується той самий стек stage-secrets через GitHub Secrets (Roadmap R1 спеку).

**CI vs local:**
- Локально: `nuxt dev` через Playwright webServer, `reuseExistingServer: true` (швидше при ітераціях).
- CI: `nuxt build` + `nuxt preview` (production-like, реалістичний SSR). Це окрема Playwright config opcja; план використовує single config з env-перемикачем.

**Чому НЕ покриваємо Hero/Footer/Header navigation у smoke:**
- Це не critical-flow. Якщо нав-кліки ламаються — `npm test` (unit/component) це зловить раніше.
- Smoke = login + interaction + persist. Все інше — окремі E2E пакети, що виконуються рідше.

**Browser:** тільки Chromium у smoke. Firefox/WebKit — окрема CI-job коли проєкт виросте до повного E2E-suite.

---

## File Structure

**Create:**
- `playwright.config.ts` — Playwright config.
- `tests/e2e/global-setup.ts` — створення тестового користувача.
- `tests/e2e/global-teardown.ts` — видалення тестового користувача.
- `tests/e2e/helpers/supabase-admin.ts` — service-role client для setup/cleanup.
- `tests/e2e/helpers/auth.ts` — login через UI.
- `tests/e2e/login-and-like.spec.ts` — Test 1.
- `tests/e2e/mobile-menu.spec.ts` — Test 2.

**Modify:**
- `package.json` — додати `test:e2e`/`test:e2e:ui` scripts + Playwright dep.
- `.gitignore` — додати `playwright-report/` і `test-results/`.

**Не змінюємо:**
- Жоден код в `app/` чи `server/`.
- Існуючі Vitest тести в `tests/composables/`, `tests/server/`, `tests/components/`.
- Vitest config (Vitest і Playwright не конфліктують — різні `test`-runner-и).

---

## Task 1: Установити Playwright + базовий config

**Files:**
- Create: `playwright.config.ts`
- Modify: `package.json`, `.gitignore`

- [ ] **Step 1: Установити Playwright + dotenv + browser binaries**

Run:
```bash
npm i -D @playwright/test dotenv
npx playwright install chromium --with-deps
```

Expected: `@playwright/test` і `dotenv` додані в `devDependencies`. Chromium binary завантажений (~150MB у `~/.cache/ms-playwright`).

`dotenv` потрібен у `globalSetup`/`globalTeardown` для завантаження `.env.stage` у Node-процесі (Playwright запускає setup-скрипти через свій runner, без `--env-file=` прапорця, який має `npm run dev`).

Якщо `--with-deps` падає на macOS (system deps reserved для Linux) — запустити без нього: `npx playwright install chromium`.

- [ ] **Step 2: Створити `playwright.config.ts`**

Файл `playwright.config.ts` (у корені):
```ts
import { defineConfig } from '@playwright/test'

const isCI = !!process.env.CI

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /.*\.spec\.ts$/,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  retries: isCI ? 2 : 0,
  workers: 1,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: isCI ? 'npm run build && npx nuxt preview' : 'npm run dev -- --host',
    url: 'http://localhost:3000',
    timeout: 120_000,
    reuseExistingServer: !isCI,
    env: { NODE_ENV: isCI ? 'production' : 'development' },
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
})
```

Чому `fullyParallel: false` і `workers: 1`: тести шерять одного тестового користувача. Паралельний запуск спричинить race на `release_likes`. Якщо потрібно прискорити — окремий user per-test (next-step у Notes).

- [ ] **Step 3: Додати npm-scripts**

В `package.json` секція `scripts`:
```json
"test:e2e": "node --env-file=.env.stage node_modules/.bin/playwright test",
"test:e2e:ui": "node --env-file=.env.stage node_modules/.bin/playwright test --ui",
"test:e2e:headed": "node --env-file=.env.stage node_modules/.bin/playwright test --headed"
```

- [ ] **Step 4: Оновити `.gitignore`**

Додати наприкінці `.gitignore`:
```
playwright-report/
test-results/
```

(Окрема секція або в кінець — на твій вибір.)

- [ ] **Step 5: Sanity-check — запуск без тестів**

Run: `npx playwright test --list`
Expected: `Found 0 tests in 0 file(s)` або повідомлення «No tests found». Жодних config-помилок.

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts package.json package-lock.json .gitignore
git commit -m "chore(e2e): bootstrap playwright config and scripts"
```

---

## Task 2: Service-role Supabase client + global setup/teardown

**Files:**
- Create: `tests/e2e/helpers/supabase-admin.ts`
- Create: `tests/e2e/global-setup.ts`
- Create: `tests/e2e/global-teardown.ts`

- [ ] **Step 1: Створити service-role helper**

`tests/e2e/helpers/supabase-admin.ts`:
```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function getAdminClient(): SupabaseClient {
  const url = process.env.NUXT_PUBLIC_SUPABASE_URL
  const key = process.env.NUXT_SUPABASE_SECRET_KEY
  if (!url || !key) {
    throw new Error('E2E: NUXT_PUBLIC_SUPABASE_URL or NUXT_SUPABASE_SECRET_KEY missing')
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export const TEST_USER_EMAIL_PREFIX = 'playwright-'
```

- [ ] **Step 2: Створити global-setup**

`tests/e2e/global-setup.ts`:
```ts
import { config as loadDotenv } from 'dotenv'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { getAdminClient, TEST_USER_EMAIL_PREFIX } from './helpers/supabase-admin'

loadDotenv({ path: '.env.stage' })

export default async function globalSetup() {
  const admin = getAdminClient()

  const email = `${TEST_USER_EMAIL_PREFIX}${Date.now()}@test.local`
  const password = `Test-${Date.now()}-${Math.random().toString(36).slice(2)}!`

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error || !data.user) {
    throw new Error(`E2E setup failed to create user: ${error?.message}`)
  }

  const fixture = { userId: data.user.id, email, password }
  writeFileSync(
    join(process.cwd(), '.playwright-fixture.json'),
    JSON.stringify(fixture),
  )

  console.log(`[e2e] created test user: ${email} (${data.user.id})`)
}
```

Pattern: фікстура зберігається у `.playwright-fixture.json` у корені (gitignored), тести читають її через хелпер.

- [ ] **Step 3: Створити global-teardown**

`tests/e2e/global-teardown.ts`:
```ts
import { readFileSync, existsSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { config as loadDotenv } from 'dotenv'
import { getAdminClient } from './helpers/supabase-admin'

loadDotenv({ path: '.env.stage' })

export default async function globalTeardown() {
  const fixturePath = join(process.cwd(), '.playwright-fixture.json')
  if (!existsSync(fixturePath)) return

  const { userId, email } = JSON.parse(readFileSync(fixturePath, 'utf-8'))
  const admin = getAdminClient()

  await admin.from('release_likes').delete().eq('user_id', userId).then((r) => {
    if (r.error) console.warn('[e2e] cleanup release_likes:', r.error.message)
  })

  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) {
    console.warn(`[e2e] failed to delete user ${email}: ${error.message}`)
  } else {
    console.log(`[e2e] deleted test user: ${email}`)
  }

  unlinkSync(fixturePath)
}
```

Якщо `dotenv` пакет ще не встановлений — це залежність Nuxt, тому має бути доступний. Якщо ні: `npm i -D dotenv`.

- [ ] **Step 4: Додати фікстуру у `.gitignore`**

В `.gitignore` наприкінці:
```
.playwright-fixture.json
```

- [ ] **Step 5: Запустити setup ізольовано (sanity)**

Run: `npx playwright test --list 2>&1 | tail -5`
Expected: список тестів (поки порожній — створимо в наступних таск-ах). globalSetup пробує створити користувача навіть на порожньому списку — це ОК для перевірки, але:

globalSetup створить test-user у `supabase-stage` (через `.env.stage`). Безпечно — це окремий проєкт, не prod.

Перевір після прогону: `cat .playwright-fixture.json` має показати JSON з `userId`/`email`/`password`. globalTeardown запуститься після тестів і видалить user-а та фікстуру.

- [ ] **Step 6: Commit**

```bash
git add tests/e2e/helpers/supabase-admin.ts tests/e2e/global-setup.ts tests/e2e/global-teardown.ts .gitignore
git commit -m "test(e2e): add supabase test user lifecycle"
```

---

## Task 3: Auth helper для UI-логіну

**Files:**
- Create: `tests/e2e/helpers/auth.ts`

- [ ] **Step 1: Створити helper**

`tests/e2e/helpers/auth.ts`:
```ts
import type { Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

type Fixture = { userId: string, email: string, password: string }

export function loadFixture(): Fixture {
  const path = join(process.cwd(), '.playwright-fixture.json')
  return JSON.parse(readFileSync(path, 'utf-8'))
}

export async function loginViaUI(page: Page) {
  const { email, password } = loadFixture()

  await page.goto('/login')
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: 'Sign In', exact: true }).click()

  await page.waitForURL('/profile', { timeout: 10_000 })
}
```

- [ ] **Step 2: Тип-чек**

Run: `npx tsc --noEmit -p tsconfig.json` (або `npx vue-tsc --noEmit`)
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/helpers/auth.ts
git commit -m "test(e2e): add login helper"
```

---

## Task 4: Test 1 — Login + Like-cycle

**Files:**
- Create: `tests/e2e/login-and-like.spec.ts`

- [ ] **Step 1: Створити `tests/e2e/helpers/seed-data.ts`**

`tests/e2e/helpers/seed-data.ts`:
```ts
export const E2E_FIXED_RELEASE_SLUG = '<підставити slug з 10 синкнутих у stage>'
```

Цей дефолт спрацьовує, коли `E2E_TEST_RELEASE_SLUG` env-var не задано. Зручно для нових контриб'юторів — після `npm run sync:supabase:stage` тест запускається без додаткової конфігурації.

- [ ] **Step 2: Створити test-файл**

`tests/e2e/login-and-like.spec.ts`:
```ts
import { test, expect } from '@playwright/test'
import { loginViaUI, loadFixture } from './helpers/auth'
import { getAdminClient } from './helpers/supabase-admin'
import { E2E_FIXED_RELEASE_SLUG } from './helpers/seed-data'

const RELEASE_SLUG = process.env.E2E_TEST_RELEASE_SLUG ?? E2E_FIXED_RELEASE_SLUG

test.describe('login and like-cycle', () => {
  test.skip(!RELEASE_SLUG, 'E2E_TEST_RELEASE_SLUG env-var not set')

  test.afterEach(async () => {
    const { userId } = loadFixture()
    const admin = getAdminClient()
    await admin.from('release_likes').delete().eq('user_id', userId)
  })

  test('юзер може залогінитись, лайкнути реліз і побачити лайк після reload', async ({ page }) => {
    await loginViaUI(page)
    expect(page.url()).toContain('/profile')

    await page.goto(`/release/${RELEASE_SLUG}`)

    const likeBtn = () => page.locator('button').filter({ has: page.locator(':text-is("Like")') })
    const likedBtn = () => page.locator('button').filter({ has: page.locator(':text-is("Liked")') })

    await expect(likeBtn()).toBeVisible()

    await likeBtn().click()
    await expect(likedBtn()).toBeVisible({ timeout: 5_000 })

    await page.reload()
    await expect(likedBtn()).toBeVisible({ timeout: 5_000 })

    await likedBtn().click()
    await expect(likeBtn()).toBeVisible({ timeout: 5_000 })
  })
})
```

Зверни увагу:
- `test.skip(!RELEASE_SLUG, ...)` пропускає тест з warning, якщо env-var не задано — гарантує, що CI/dev без сід-данних не падає.
- `name: /^Like$/` — точний match, не `/Like/i`, бо «Liked» теж збігається з `/Like/`. Regex `/^Like$/` ловить тільки текст без «d» наприкінці.
- `afterEach` — додаткова страховка cleanup.

- [ ] **Step 3: Задати env-var і запустити**

Slug має бути одним з 10 релізів синкнутих у `supabase-stage` через `npm run sync:supabase:stage`. Перевірити доступні: `https://<stage-ref>.supabase.co` → Table editor → releases. Записати у `.env.stage`:
```
E2E_TEST_RELEASE_SLUG=actual-release-slug
```

Альтернативно: створити `tests/e2e/helpers/seed-data.ts` з fallback-константою (див. Step 2).

Run:
```bash
npm run test:e2e -- login-and-like
```

Це використовує `--env-file=.env.stage` (з `package.json` `test:e2e` script), а globalSetup додатково підвантажує `.env.stage` через dotenv для test-runner-а.

Expected: 1 test passed. Час ~10–15s (включає dev-server boot, login, like-cycle, cleanup).

Якщо red:
- «Cannot fill Email» → перевір, що `<label>Email</label>` у `pages/login.vue` має `for=...`-зв'язок з input-ом. Якщо ні — використати `page.locator('input[type=email]').fill(...)`.
- «waitForURL '/profile' timeout» → юзер не зміг залогінитись. Перевір `email_confirm: true` у globalSetup. Альтернатива — глянути `error.value` у `pages/login.vue` через `page.locator('.text-red-400').textContent()`.
- «Like button не знайдено» → перевір, що release/[id].vue рендерить `<button>` з текстом «Like» (рядок 101 у компоненті: `{{ isLiked(item.slug) ? 'Liked' : 'Like' }}`).
- «після reload Liked зник» → це регресія в `useLikes.load()` — баг в SSR-payload restoration. Дослідити (це той самий код, що покритий планом 1).

- [ ] **Step 4: Прогон з UI-mode для дослідження** (опційно)

Run: `npm run test:e2e:ui`
Це відкриває Playwright UI з timeline, traces. Корисно для перших дебаг-сесій.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/login-and-like.spec.ts
git commit -m "test(e2e): cover login and release like-cycle"
```

---

## Task 5: Test 2 — Mobile menu open/close

**Files:**
- Create: `tests/e2e/mobile-menu.spec.ts`

- [ ] **Step 1: Створити test-файл**

`tests/e2e/mobile-menu.spec.ts`:
```ts
import { test, expect } from '@playwright/test'

test.use({ viewport: { width: 375, height: 667 } })

test.describe('mobile menu', () => {
  test('hamburger відкриває sidebar, Esc закриває з body-scroll-unlock', async ({ page }) => {
    await page.goto('/')

    const toggle = page.locator('button[aria-controls="mobile-sidebar"]')
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')

    const panel = page.locator('#mobile-sidebar')
    await expect(panel).toHaveAttribute('inert', '')

    await toggle.click()

    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(panel).not.toHaveAttribute('inert', '')

    const overflowOpen = await page.evaluate(() => document.body.style.overflow)
    expect(overflowOpen).toBe('hidden')

    await page.keyboard.press('Escape')

    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(panel).toHaveAttribute('inert', '')

    const overflowClosed = await page.evaluate(() => document.body.style.overflow)
    expect(overflowClosed).toBe('')
  })

  test('panel має role="dialog" і aria-modal="true"', async ({ page }) => {
    await page.goto('/')
    const panel = page.locator('#mobile-sidebar')

    await expect(panel).toHaveAttribute('role', 'dialog')
    await expect(panel).toHaveAttribute('aria-modal', 'true')
    await expect(panel).toHaveAttribute('aria-label', /.+/)
  })
})
```

Зверни увагу:
- `viewport: { width: 375, height: 667 }` — iPhone SE розмір; гарантує, що `<OpenSidebar class="md:hidden" />` видимий, а горизонтальна нав прихована.
- `not.toHaveAttribute('inert', '')` — Playwright перевіряє, що значення атрибута НЕ дорівнює порожньому рядку. Vue видаляє атрибут коли `inert: false`, тому атрибут відсутній взагалі — assert проходить.
- Backdrop-click додатково НЕ покриваємо в smoke — Esc тестує той самий close-path. Якщо хочеш — додай у follow-up.

- [ ] **Step 2: Запустити**

Run: `npm run test:e2e -- mobile-menu`
Expected: 2 tests passed.

Якщо red:
- «toggle button не видимий» → перевір viewport і що Header.vue рендерить `<OpenSidebar>` з `md:hidden` (на 375px sidebar має бути видимий). Якщо `<OpenSidebar>` не рендериться зовсім (закоментований у Header) — розкоментувати.
- «aria-expanded не змінюється» → перевір, що OpenSidebar.vue має `:aria-expanded="isOpen"` на toggle button (це вже зроблено в правках).
- «overflow not hidden» → перевір, що `watch(isOpen, ...)` пише в `document.body.style.overflow` (це зроблено в правках).

- [ ] **Step 3: Прогон обох E2E-тестів разом**

Run: `npm run test:e2e`
Expected: 3 tests passed (1 login-and-like + 2 mobile-menu). Час ~30–45s включаючи dev-server boot.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/mobile-menu.spec.ts
git commit -m "test(e2e): cover mobile menu open/close with ARIA"
```

---

## Task 6: Final verification + CI scaffold

**Files:**
- Create: `.github/workflows/test.yml` (опційно — у Notes)

- [ ] **Step 1: Прогон усіх тест-suite-ів**

Run:
```bash
npm test
npm run test:e2e
```

Expected:
- Vitest: 35 tests passed.
- Playwright: 3 tests passed.
- **Загалом 38 tests, 0 failed.**
- Час: Vitest <15s, Playwright <60s.

- [ ] **Step 2: Подвійний прогон — стабільність**

Run: `npm run test:e2e && npm run test:e2e`
Expected: обидва прогони зелені. globalSetup кожного разу створює нового користувача (timestamp у email), teardown чистить його. Якщо teardown пропустився — лишиться "осиротілий" user; перевір через `select * from auth.users where email like 'playwright-%'` у **stage-Supabase** (`supabase-stage` проєкт).

- [ ] **Step 3: Type-check + build перевірка**

Run: `npx vue-tsc --noEmit && npm run build`
Expected: 0 type errors, build success. Тестова інфраструктура `tests/e2e/` не потрапляє в Nuxt-build.

- [ ] **Step 4: Перевірити, що `.env.stage` / `.env.prod` не закомічені**

Run: `git status && git ls-files .env.stage .env.prod`
Expected: жоден з env-файлів НЕ в git (мають бути в `.gitignore`). Якщо закомічений — критична помилка, видалити з історії окремо.

- [ ] **Step 5: Final commit якщо щось ще додалось**

```bash
git status
# Якщо чисто — без коміту.
```

---

## Notes для виконавця

**Test-Supabase invariant:**
`.env.stage` має вказувати на `supabase-stage` проєкт (див. spec `2026-05-02-test-environments-design.md`). Перевірити: запустити `npm run dev` → DevTools network → URL має йти на stage-ref, не prod-ref.

CI коли з'явиться (Roadmap R1 спеку) використовуватиме той самий стек stage-secrets через GitHub Secrets (`E2E_SUPABASE_URL`, `E2E_SUPABASE_KEY`, `E2E_SUPABASE_SECRET_KEY`, `E2E_TEST_RELEASE_SLUG`).

Локальний Docker-Supabase (`supabase start`) — окрема ініціатива, Roadmap R2.

**CI scaffold:**

Якщо вирішиш додати GitHub Actions — `.github/workflows/test.yml`:
```yaml
name: Test
on: [push, pull_request]
jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '24', cache: 'npm' }
      - run: npm ci
      - run: npx vue-tsc --noEmit
      - run: npm test
      - run: npm run build

  e2e:
    runs-on: ubuntu-latest
    needs: unit
    env:
      NUXT_PUBLIC_SUPABASE_URL: ${{ secrets.E2E_SUPABASE_URL }}
      NUXT_PUBLIC_SUPABASE_KEY: ${{ secrets.E2E_SUPABASE_KEY }}
      NUXT_SUPABASE_SECRET_KEY: ${{ secrets.E2E_SUPABASE_SECRET_KEY }}
      E2E_TEST_RELEASE_SLUG: ${{ secrets.E2E_TEST_RELEASE_SLUG }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '24', cache: 'npm' }
      - run: npm ci
      - run: npx playwright install chromium --with-deps
      - run: npm run test:e2e
      - if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

CI використовує **окремий test-Supabase** через GitHub Secrets, не production-проєкт.

**Що далі (поза цим планом):**

1. **Розширити E2E**: profile-сторінка показує liked releases, search/filter (коли з'явиться), 404-сторінка.
2. **Cross-browser**: додати Firefox + WebKit projects у Playwright config.
3. **Visual regression**: `await expect(page).toHaveScreenshot()` для Hero/Item/Header — захищає від CSS-регресій.
4. **Test data factory**: створення `releases` row у `globalSetup` через service-role, замість `E2E_TEST_RELEASE_SLUG`. Усуне залежність від сід-данних і паралелізує тести (кожен тест має свій release).
5. **Per-test users** для паралелізму: `globalSetup` створює пул з 5 user-ів, тести беруть з пула через worker fixture. Тоді `fullyParallel: true`, `workers: 4`.
6. **Mocking external services**: Supabase auth — реальний; але YouTube/Bandcamp iframe-и можна mock-нути через `page.route()`, щоб тести не залежали від external uptime.

**Якщо тест 1 нестабільний (flaky):**
- Збільш timeout у `.click()` і `.waitForURL` (зараз 10s).
- Перевір network throttling — Supabase auth може запиняти на 1-2s у cold-start.
- Додай retry в config (вже `retries: 2` у CI).
- Відкрий Playwright trace після failure: `npx playwright show-report`.

**Performance-нюанс:**
`webServer.command: 'npm run dev -- --host'` локально ставить Nuxt у dev-mode (HMR, jit-compilation), що дає ~30s першого старту. Для прискорення локальних E2E:
- Запускай `npm run dev` у окремому терміналі заздалегідь.
- Playwright побачить `reuseExistingServer: true` (вже в config) — startup ~5s замість 30s.
- Або використай `nuxt build && nuxt preview` локально як в CI — швидший runtime, повільніший boot.
