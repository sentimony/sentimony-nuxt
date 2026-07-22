# Homepage Light Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the existing homepage a production-ready Morning Veil light theme while deriving both themes from the same original forest photograph and leaving all non-home routes structurally unchanged.

**Architecture:** Add a route-scoped `HomepageAtmosphere` layer behind the existing `Fractal` and content layers. The component owns the single background-image request and theme-specific filters/overlays; existing homepage components become token-aware so foregrounds and interactive states remain legible in both themes. Playwright covers route scoping, theme persistence, reduced motion, responsive overflow, and desktop/mobile visual baselines.

**Tech Stack:** Nuxt 4, Vue 3, Tailwind CSS 4, CSS custom properties/pseudo-elements, View Transitions API, Playwright 1.60.

---

## File Map

- Create `app/components/HomepageAtmosphere.vue`: fixed, non-interactive forest image layer used only on `/`.
- Modify `app/layouts/default.vue`: mount the atmosphere behind the existing fractal and page content only when `isIndex` is true.
- Modify `app/components/Hero.vue`: use theme foreground/background tokens without changing copy, sizing, or composition.
- Modify `app/pages/index.vue`: make the existing reading surface, links, and white SVG logos legible in light mode.
- Modify `app/components/Header.vue`: give the sticky header a stable light-theme reading surface.
- Modify `app/components/ThemeToggle.vue`: make the hover surface theme-aware.
- Modify `app/components/Swiper.vue`: make pagination and controls use theme foreground tokens.
- Modify `app/components/Item.vue`: make thumbnail hover/active surfaces theme-aware and keep status badge text white.
- Modify `app/components/Fractal.vue`: suppress the existing animation when reduced motion is requested.
- Create `playwright.config.ts`: run desktop and mobile Chromium against the Nuxt dev server.
- Create `tests/e2e/homepage-theme.spec.ts`: behavioral, responsive, reduced-motion, and visual checks.
- Modify `package.json` and `package-lock.json`: add `@playwright/test` and E2E scripts.
- Modify `.gitignore`: ignore generated Playwright reports and test results.
- Modify `DESIGN.md`, `CLAUDE.md`, and the two theme specs: document the final one-image homepage treatment and mark implemented work accurately.

Do not add or modify `docs/impeccable/2026-06-11-profile-v2-design-brief.md`; it is an unrelated user document.

### Task 1: Add A Failing Homepage Atmosphere Contract

**Files:**
- Modify: `.gitignore`
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `playwright.config.ts`
- Create: `tests/e2e/homepage-theme.spec.ts`

- [ ] **Step 1: Install the Playwright test runner**

Run:

```bash
npm install --save-dev @playwright/test@1.60.0
```

Expected: `package.json` and `package-lock.json` record `@playwright/test` at `1.60.0`; the existing `playwright` dependency remains unchanged.

- [ ] **Step 2: Add E2E scripts**

Add these entries to `package.json` under `scripts`:

```json
"test:e2e": "playwright test",
"test:e2e:update": "playwright test --update-snapshots"
```

- [ ] **Step 3: Create the Playwright configuration**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://127.0.0.1:3000'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  timeout: 30_000,
  expect: {
    timeout: 7_500,
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
    },
  },
  use: {
    baseURL,
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile-chromium',
      use: {
        ...devices['Pixel 7'],
      },
    },
  ],
  webServer: {
    command: 'npm run dev -- --port 3000',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
```

- [ ] **Step 4: Ignore generated Playwright output**

Append to `.gitignore`:

```gitignore
/playwright-report/
/test-results/
```

- [ ] **Step 5: Write the failing route and image-source test**

Create `tests/e2e/homepage-theme.spec.ts`:

```ts
import { expect, test, type Page } from '@playwright/test'

const forestUrl = 'https://content.sentimony.com/assets/img/backgrounds/trees-origin_v1.jpg'

async function openWithTheme(page: Page, theme: 'light' | 'dark', path = '/') {
  await page.addInitScript((initialTheme) => {
    localStorage.setItem('theme', initialTheme)
  }, theme)
  await page.goto(path)
}

async function readAtmosphereStyles(page: Page) {
  return page.getByTestId('homepage-atmosphere').evaluate((element) => {
    const imageLayer = getComputedStyle(element, '::before')
    return {
      backgroundImage: imageLayer.backgroundImage,
      filter: imageLayer.filter,
    }
  })
}

test('uses one theme-aware forest source only on the homepage', async ({ page }) => {
  await openWithTheme(page, 'light')

  const atmosphere = page.getByTestId('homepage-atmosphere')
  await expect(atmosphere).toBeVisible()

  const lightStyles = await readAtmosphereStyles(page)
  expect(lightStyles.backgroundImage).toContain('trees-origin_v1.jpg')

  await page.getByRole('button', { name: 'Switch to dark theme' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)

  const darkStyles = await readAtmosphereStyles(page)
  expect(darkStyles.backgroundImage).toBe(lightStyles.backgroundImage)
  expect(darkStyles.filter).not.toBe(lightStyles.filter)

  await page.goto('/contacts')
  await expect(atmosphere).toHaveCount(0)
  await expect(page.locator('body')).not.toHaveClass(/homepage-route/)
  const nonHomeBackground = await page.locator('body').evaluate((element) => {
    return getComputedStyle(element).backgroundImage
  })
  expect(nonHomeBackground).toContain('trees-green_v5')
})

test('references the approved source URL', async () => {
  expect(forestUrl).toBe('https://content.sentimony.com/assets/img/backgrounds/trees-origin_v1.jpg')
})
```

- [ ] **Step 6: Install Chromium if the local cache does not already contain it**

Run:

```bash
npx playwright install chromium
```

Expected: Chromium installs or Playwright reports that the browser is already installed.

- [ ] **Step 7: Run the contract and verify it fails**

Run:

```bash
npm run test:e2e -- --project=chromium --grep "one theme-aware forest"
```

Expected: FAIL because `[data-testid="homepage-atmosphere"]` does not exist.

- [ ] **Step 8: Commit the failing test harness**

```bash
git add .gitignore package.json package-lock.json playwright.config.ts tests/e2e/homepage-theme.spec.ts
git commit -m "test: define homepage theme contract"
```

### Task 2: Add The Route-Scoped Forest Atmosphere

**Files:**
- Create: `app/components/HomepageAtmosphere.vue`
- Modify: `app/layouts/default.vue:94-101`
- Modify: `app/pages/index.vue:12-27`
- Test: `tests/e2e/homepage-theme.spec.ts`

- [ ] **Step 1: Create the atmosphere component**

Create `app/components/HomepageAtmosphere.vue`:

```vue
<template>
  <div
    data-testid="homepage-atmosphere"
    class="homepage-atmosphere"
    aria-hidden="true"
  />
</template>

<style>
.homepage-atmosphere {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: oklch(0.91 0.025 155);
}

.homepage-atmosphere::before,
.homepage-atmosphere::after {
  position: absolute;
  content: "";
}

.homepage-atmosphere::before {
  inset: -2vmax;
  background-image: url("https://content.sentimony.com/assets/img/backgrounds/trees-origin_v1.jpg");
  background-repeat: no-repeat;
  background-position: 50% 44%;
  background-size: cover;
  filter: brightness(1.28) contrast(0.68) saturate(0.58);
  transform: scale(1.02);
}

.homepage-atmosphere::after {
  inset: 0;
  background:
    radial-gradient(
      circle at 50% 38%,
      oklch(1 0 0 / 58%) 0%,
      oklch(0.97 0.01 155 / 28%) 34%,
      transparent 58%
    ),
    linear-gradient(
      to bottom,
      oklch(0.97 0.01 155 / 72%) 0%,
      oklch(0.92 0.02 155 / 48%) 52%,
      oklch(0.88 0.025 155 / 70%) 100%
    );
}

.dark .homepage-atmosphere {
  background: oklch(0.12 0.025 155);
}

.dark .homepage-atmosphere::before {
  filter: brightness(0.58) contrast(1.12) saturate(0.68);
}

.dark .homepage-atmosphere::after {
  background:
    radial-gradient(
      circle at 50% 40%,
      oklch(0.3 0.035 155 / 12%) 0%,
      transparent 52%
    ),
    linear-gradient(
      to bottom,
      oklch(0.08 0.02 155 / 42%) 0%,
      oklch(0.12 0.025 155 / 24%) 48%,
      oklch(0.06 0.015 155 / 68%) 100%
  );
}

.dark body.homepage-route {
  background-color: oklch(0.12 0.025 155);
  background-image: none;
}

@media (max-width: 640px) {
  .homepage-atmosphere::before {
    background-position: 50% 50%;
    transform: scale(1.04);
  }
}
</style>
```

- [ ] **Step 2: Add a page-specific body class before paint**

In `app/pages/index.vue`, add this call after the existing `useSeoMeta(...)` block:

```ts
useHead({
  bodyAttrs: {
    class: 'homepage-route',
  },
})
```

This higher-specificity body class disables the legacy dark body image only on `/`, so the browser does not request both forest files.

- [ ] **Step 3: Mount the atmosphere behind existing layers on `/` only**

In `app/layouts/default.vue`, replace the start of the template with:

```vue
<template>
  <HomepageAtmosphere v-if="isIndex" />

  <Fractal class="z-[1]" />

  <OpenSidebar />

  <div class="min-h-screen flex flex-col relative z-[2]">
```

Keep the remaining layout, hero, swipers, slot, testimonials, and footer in their current order.

- [ ] **Step 4: Run the focused contract**

Run:

```bash
npm run test:e2e -- --project=chromium --grep "one theme-aware forest"
```

Expected: PASS. The homepage has one original-image layer, light and dark filters differ, and `/contacts` has no homepage atmosphere element.

- [ ] **Step 5: Verify the dark background of non-home routes did not change**

Run:

```bash
rg -n "trees-green_v5|trees-origin_v1" app/assets/css/tailwind.css app/components/HomepageAtmosphere.vue
```

Expected:

```text
app/assets/css/tailwind.css:...trees-green_v5.jpg
app/components/HomepageAtmosphere.vue:...trees-origin_v1.jpg
```

- [ ] **Step 6: Commit the atmosphere layer**

```bash
git add app/components/HomepageAtmosphere.vue app/layouts/default.vue app/pages/index.vue
git commit -m "feat: add homepage forest atmosphere"
```

### Task 3: Make Existing Homepage Content Theme-Aware

**Files:**
- Modify: `tests/e2e/homepage-theme.spec.ts`
- Modify: `app/components/Hero.vue:7-44`
- Modify: `app/pages/index.vue:30-45`
- Modify: `app/components/Header.vue:17-18`
- Modify: `app/components/ThemeToggle.vue:6-15`
- Modify: `app/components/Swiper.vue:117-130`
- Modify: `app/components/Item.vue:24-83`
- Modify: `app/components/Fractal.vue:1-51`

- [ ] **Step 1: Expand the tests for persistence, reduced motion, and responsive overflow**

Replace `tests/e2e/homepage-theme.spec.ts` with:

```ts
import { expect, test, type Page } from '@playwright/test'

const forestUrl = 'https://content.sentimony.com/assets/img/backgrounds/trees-origin_v1.jpg'

async function openWithTheme(page: Page, theme: 'light' | 'dark', path = '/') {
  await page.addInitScript((initialTheme) => {
    localStorage.setItem('theme', initialTheme)
  }, theme)
  await page.goto(path)
}

async function waitForHomepageAssets(page: Page) {
  await page.getByTestId('homepage-atmosphere').waitFor()
  await page.evaluate(async (url) => {
    const image = new Image()
    image.src = url
    await image.decode()
    await document.fonts.ready
  }, forestUrl)
}

async function readAtmosphereStyles(page: Page) {
  return page.getByTestId('homepage-atmosphere').evaluate((element) => {
    const imageLayer = getComputedStyle(element, '::before')
    return {
      backgroundImage: imageLayer.backgroundImage,
      filter: imageLayer.filter,
    }
  })
}

test('uses one theme-aware forest source only on the homepage', async ({ page }) => {
  await openWithTheme(page, 'light')

  const atmosphere = page.getByTestId('homepage-atmosphere')
  await expect(atmosphere).toBeVisible()

  const lightStyles = await readAtmosphereStyles(page)
  expect(lightStyles.backgroundImage).toContain('trees-origin_v1.jpg')

  await page.getByRole('button', { name: 'Switch to dark theme' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)

  const darkStyles = await readAtmosphereStyles(page)
  expect(darkStyles.backgroundImage).toBe(lightStyles.backgroundImage)
  expect(darkStyles.filter).not.toBe(lightStyles.filter)

  await page.goto('/contacts')
  await expect(atmosphere).toHaveCount(0)
  await expect(page.locator('body')).not.toHaveClass(/homepage-route/)
  const nonHomeBackground = await page.locator('body').evaluate((element) => {
    return getComputedStyle(element).backgroundImage
  })
  expect(nonHomeBackground).toContain('trees-green_v5')
})

test('persists the selected theme across reloads', async ({ page }) => {
  await openWithTheme(page, 'dark')

  await page.getByRole('button', { name: 'Switch to light theme' }).click()
  await expect(page.locator('html')).not.toHaveClass(/dark/)

  await page.reload()

  await expect(page.locator('html')).not.toHaveClass(/dark/)
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible()
})

test('loads only the approved forest asset on the homepage', async ({ page }) => {
  await openWithTheme(page, 'dark')
  await waitForHomepageAssets(page)

  const forestRequests = await page.evaluate(() => {
    return performance
      .getEntriesByType('resource')
      .map(entry => entry.name)
      .filter(name => name.includes('/backgrounds/trees-'))
  })

  expect(forestRequests).toEqual([forestUrl])
})

test('keeps the homepage legible when the forest image is unavailable', async ({ page }) => {
  await page.route(forestUrl, route => route.abort())
  await openWithTheme(page, 'light')

  await expect(page.getByTestId('homepage-hero')).toBeVisible()
  await expect(page.getByTestId('homepage-about')).toBeVisible()

  const fallbackColor = await page.getByTestId('homepage-atmosphere').evaluate((element) => {
    return getComputedStyle(element).backgroundColor
  })
  expect(fallbackColor).not.toBe('rgba(0, 0, 0, 0)')
})

test('uses theme foregrounds and stable reading surfaces', async ({ page }) => {
  await openWithTheme(page, 'light')
  await waitForHomepageAssets(page)

  const hero = page.getByTestId('homepage-hero')
  const about = page.getByTestId('homepage-about')
  const header = page.getByTestId('site-header')

  const lightStyles = await Promise.all([
    hero.evaluate((element) => getComputedStyle(element).color),
    about.evaluate((element) => getComputedStyle(element).backgroundColor),
    header.evaluate((element) => getComputedStyle(element).backgroundColor),
  ])

  expect(lightStyles[1]).not.toBe('rgba(0, 0, 0, 0)')
  expect(lightStyles[2]).not.toBe('rgba(0, 0, 0, 0)')

  await page.getByRole('button', { name: 'Switch to dark theme' }).click()

  const darkStyles = await Promise.all([
    hero.evaluate((element) => getComputedStyle(element).color),
    about.evaluate((element) => getComputedStyle(element).backgroundColor),
    header.evaluate((element) => getComputedStyle(element).backgroundColor),
  ])

  expect(darkStyles[0]).not.toBe(lightStyles[0])
  expect(darkStyles[1]).not.toBe(lightStyles[1])
  expect(darkStyles[2]).not.toBe(lightStyles[2])

  const themeToggle = page.getByRole('button', { name: 'Switch to light theme' })
  await themeToggle.focus()
  await expect(themeToggle).toBeFocused()
  await expect(themeToggle).toHaveClass(/focus-visible:ring-2/)
})

test('switches instantly when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'dark')
    const testWindow = window as Window & { __viewTransitionCalls: number }
    testWindow.__viewTransitionCalls = 0
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: () => {
        testWindow.__viewTransitionCalls += 1
        return { ready: Promise.resolve() }
      },
    })
  })
  await page.goto('/')

  await page.getByRole('button', { name: 'Switch to light theme' }).click()

  await expect(page.locator('html')).not.toHaveClass(/dark/)
  const calls = await page.evaluate(() => {
    return (window as Window & { __viewTransitionCalls: number }).__viewTransitionCalls
  })
  expect(calls).toBe(0)
  await expect(page.locator('.fractal-orbit')).toHaveCSS('animation-name', 'none')
})

test('switches themes when View Transitions are unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'dark')
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: undefined,
    })
  })
  await page.goto('/')

  await page.getByRole('button', { name: 'Switch to light theme' }).click()

  await expect(page.locator('html')).not.toHaveClass(/dark/)
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible()
})

for (const viewport of [
  { name: 'minimum-mobile', width: 320, height: 700 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'wide-desktop', width: 1440, height: 900 },
]) {
  test(`keeps the homepage inside the ${viewport.name} viewport`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await openWithTheme(page, 'light')

    const hero = page.getByTestId('homepage-hero')
    await expect(hero).toBeVisible()

    const heroBox = await hero.boundingBox()
    expect(heroBox).not.toBeNull()
    expect(heroBox!.x).toBeGreaterThanOrEqual(0)
    expect(heroBox!.x + heroBox!.width).toBeLessThanOrEqual(viewport.width)

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(dimensions.scrollWidth).toBe(dimensions.clientWidth)
  })
}
```

- [ ] **Step 2: Run the new tests and verify the expected failures**

Run:

```bash
npm run test:e2e -- --project=chromium --grep "foregrounds|reduced motion|viewport"
```

Expected: FAIL because the hero/about test IDs and theme-aware treatments are not present, and `.fractal-orbit` does not yet disable motion.

- [ ] **Step 3: Make the hero use theme tokens without changing its composition**

In `app/components/Hero.vue`, change only the root class and add the test ID:

```vue
<div
  data-testid="homepage-hero"
  class="font-julius relative leading-[1.4] text-foreground
  bg-gradient-to-b from-background/70 via-background/75 to-background/85
  dark:from-transparent dark:via-transparent dark:to-black/50
  py-[7.5em]
  sm:py-[8.5em]
  md:py-[9.5em]
  lg:py-[10.5em]
  xl:py-[11.5em]"
>
```

Leave the wordmark copy, breakpoints, font sizes, tracking, and internal markup unchanged.

- [ ] **Step 4: Make the existing about surface and logos theme-aware**

In `app/pages/index.vue`, replace the template with:

```vue
<template>
  <div
    data-testid="homepage-about"
    class="bg-background/90 dark:bg-black/50"
  >
    <div class="max-w-lg mx-auto px-2 py-10">
      <p>
        <img
          class="mx-auto invert dark:invert-0"
          :src="logoNewUrlv1"
          :alt="logoNewAltv1"
          width="60"
          height="60"
        >
      </p>
      <div
        class="text-left indent-5
        [&>p>a]:text-emerald-800 [&>p>a:hover]:text-emerald-950
        dark:[&>p>a]:text-green-500 dark:[&>p>a:hover]:text-green-300"
        v-html="aboutDescription"
      />
      <p>
        <img
          class="mx-auto invert dark:invert-0"
          :src="logoOldUrl"
          :alt="logoOldAlt"
          width="60"
          height="60"
        >
      </p>
    </div>
  </div>
</template>
```

Do not change `aboutDescription` or SEO metadata.

- [ ] **Step 5: Give the sticky header a stable light reading surface**

In `app/components/Header.vue`, replace the outer root element with:

```vue
<div
  data-testid="site-header"
  class="sticky top-0 left-0 w-full z-20
  border-b border-black/10 dark:border-white/30
  bg-background/80 dark:bg-white/5
  backdrop-blur-sm overflow-hidden"
>
```

Leave its dimensions, navigation, logo, social links, and authentication actions unchanged.

- [ ] **Step 6: Fix the theme toggle hover surface**

In `app/components/ThemeToggle.vue`, replace the button class with:

```vue
class="flex items-center justify-center transition-[background-color] ease-in-out duration-300
hover:bg-black/10 dark:hover:bg-white/30
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
focus-visible:ring-offset-2 focus-visible:ring-offset-background
w-[46px] lg:w-[56px] h-[56px] rounded-[2px]"
```

- [ ] **Step 7: Make homepage-visible Swiper controls theme-aware**

In the `<style>` block of `app/components/Swiper.vue`, replace the pagination and button rules with:

```css
.swiper-pagination { @apply text-xs/3 md:text-sm/4 text-foreground/50 }

.swiper-button-prev,
.swiper-button-next { @apply transition-colors ease-in-out duration-300 cursor-pointer absolute top-[0px] h-[100%] z-10 text-foreground/40 hover:text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5 hover:backdrop-blur-sm hidden md:block p-4 }
.swiper-button-prev { @apply left-0 }
.swiper-button-next { @apply right-0 }

.swiper-button-prev svg,
.swiper-button-next svg { @apply size-6 }
.swiper-button-prev svg { @apply rotate-[180deg] }

.swiper-button-disabled { @apply text-foreground/10 pointer-events-none }
```

Dark mode remains visually equivalent because `--foreground` is white in `.dark`.

- [ ] **Step 8: Make thumbnail interaction surfaces theme-aware**

In `app/components/Item.vue`:

1. Replace `group-hover:bg-white/30` with `group-hover:bg-black/10 dark:group-hover:bg-white/30`.
2. Replace the active class expression with:

```vue
:class="isActive ? 'bg-black/10 dark:bg-white/20' : ''"
```

3. Add `text-white` to both status badge class lists:

```vue
<div v-if="i.coming_soon" class="text-white text-[8px] md:text-[10px] leading-none absolute top-[-3px] md:top-[0] right-[-3px] md:right-[0] bg-green-600 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] p-1 rounded-tr-sm rounded-bl-sm">Coming Soon</div>
<div v-if="i.new" class="text-white text-[8px] md:text-[10px] leading-none absolute top-[-3px] md:top-[0] right-[-3px] md:right-[0] bg-red-600 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] p-1 rounded-tr-sm rounded-bl-sm">Out Now</div>
```

- [ ] **Step 9: Disable the existing fractal animation for reduced motion**

In `app/components/Fractal.vue`:

1. Add `fractal-orbit` to the outer fixed element.
2. Add `fractal-petal` to the inner rounded element.
3. Append:

```vue
<style>
@media (prefers-reduced-motion: reduce) {
  .fractal-orbit,
  .fractal-petal {
    animation: none !important;
    transition: none !important;
  }
}
</style>
```

- [ ] **Step 10: Run behavioral and responsive tests**

Run:

```bash
npm run test:e2e -- --project=chromium
```

Expected: all behavioral, persistence, reduced-motion, route-scope, and viewport tests PASS.

- [ ] **Step 11: Repeat the critical suite to detect timing instability**

Run:

```bash
npm run test:e2e -- --project=chromium --repeat-each=3
```

Expected: three consecutive passes with no locator or transition timing failures.

- [ ] **Step 12: Commit the theme-aware homepage content**

```bash
git add app/components/Hero.vue app/pages/index.vue app/components/Header.vue app/components/ThemeToggle.vue app/components/Swiper.vue app/components/Item.vue app/components/Fractal.vue tests/e2e/homepage-theme.spec.ts
git commit -m "feat: polish homepage light theme"
```

### Task 4: Add Visual Baselines, Verify The Build, And Update Design Context

**Files:**
- Modify: `tests/e2e/homepage-theme.spec.ts`
- Create: `tests/e2e/homepage-theme.spec.ts-snapshots/*`
- Modify: `DESIGN.md`
- Modify: `CLAUDE.md`
- Modify: `docs/superpowers/specs/2026-06-01-theme-toggle-design.md`
- Modify: `docs/superpowers/specs/2026-06-06-homepage-light-theme-design.md`

- [ ] **Step 1: Add desktop and mobile visual checks**

Append to `tests/e2e/homepage-theme.spec.ts`:

```ts
for (const theme of ['light', 'dark'] as const) {
  test(`matches the approved ${theme} homepage treatment`, async ({ page }) => {
    await openWithTheme(page, theme)
    await waitForHomepageAssets(page)

    await expect(page).toHaveScreenshot(`homepage-${theme}.png`, {
      animations: 'disabled',
      mask: [
        page.locator('.swiper-release'),
        page.locator('.swiper-artist'),
      ],
    })
  })
}
```

The same tests run in the `chromium` and `mobile-chromium` projects, producing four baselines.

- [ ] **Step 2: Generate the approved visual baselines**

Run:

```bash
npm run test:e2e:update
```

Expected: all tests PASS and Playwright writes light/dark snapshots for desktop and mobile under `tests/e2e/homepage-theme.spec.ts-snapshots/`.

- [ ] **Step 3: Inspect the four baselines**

Confirm each image shows:

- The same radial forest composition in both themes.
- Morning Veil treatment in light mode with dark forest-ink text.
- No clipped `Sentimony Records` wordmark at mobile width.
- White hero text and restrained green-black treatment in dark mode.
- Header controls visible against both treatments.
- No new decorative shapes beyond the existing fractal.
- Reading copy resting on a stable, quiet tonal surface.

If tuning is required, change only the numeric filter/overlay values in `HomepageAtmosphere.vue`, regenerate snapshots, and rerun the full suite.

- [ ] **Step 4: Update `DESIGN.md`**

Make these exact documentation changes:

1. In the overview, replace the statement that the light theme is only a pale-mist canvas with:

```markdown
- Dark-default, with the original radial forest photograph treated as a nocturnal green-black canopy; the homepage light theme reuses the same source as a Morning Veil scene.
```

2. Under **Morning Mist**, add:

```markdown
On the homepage it is used as a translucent atmospheric veil over the original forest photograph, not as a flat replacement for imagery.
```

3. Replace **The Photographic Depth Rule** with:

```markdown
**The Photographic Depth Rule.** The homepage uses one source photograph, `trees-origin_v1.jpg`, in both themes. Dark mode deepens it into a green-black nocturnal canopy; light mode lowers contrast and saturation beneath a pale green morning veil. Theme identity comes from filters and overlays, never separate exported background images.
```

4. Update the Hero description so its text is `Forest Ink` in light mode and `Bone White` in dark mode.

- [ ] **Step 5: Update repository guidance and spec statuses**

In `CLAUDE.md`, replace the styling sentence about the body background with:

```markdown
`body` still provides the legacy dark forest background for non-home routes. The homepage mounts `HomepageAtmosphere.vue` only on `/`; it reuses `trees-origin_v1.jpg` for both themes with Morning Veil light filters and nocturnal dark filters behind the existing fractal/content layers.
```

In `docs/superpowers/specs/2026-06-01-theme-toggle-design.md`, replace the current status with:

```markdown
**Статус:** реалізовано
```

In `docs/superpowers/specs/2026-06-06-homepage-light-theme-design.md`, replace the current status with:

```markdown
**Status:** Implemented
```

In `docs/superpowers/specs/2026-06-06-homepage-light-theme-design.md`, add the implementation date:

```markdown
**Implemented:** 2026-06-06
```

- [ ] **Step 6: Run type checking**

Run:

```bash
npx nuxi typecheck
```

Expected: exit code 0 with no Vue or TypeScript errors.

- [ ] **Step 7: Run the production build**

Run:

```bash
npm run build
```

Expected: Nuxt production build completes successfully.

- [ ] **Step 8: Run the complete desktop/mobile E2E suite**

Run:

```bash
npm run test:e2e
```

Expected: all Chromium desktop/mobile functional and visual tests PASS.

- [ ] **Step 9: Verify the approved source is requested only once on the homepage**

Run:

```bash
rg -n "trees-origin_v1" app
```

Expected: exactly one runtime reference, in `app/components/HomepageAtmosphere.vue`.

- [ ] **Step 10: Commit final verification assets and documentation**

```bash
git add package.json package-lock.json playwright.config.ts tests/e2e app/components/HomepageAtmosphere.vue app/layouts/default.vue app/components/Hero.vue app/pages/index.vue app/components/Header.vue app/components/ThemeToggle.vue app/components/Swiper.vue app/components/Item.vue app/components/Fractal.vue DESIGN.md CLAUDE.md docs/superpowers/specs/2026-06-01-theme-toggle-design.md docs/superpowers/specs/2026-06-06-homepage-light-theme-design.md
git commit -m "test: verify homepage theme treatment"
```

## Final Acceptance Checklist

- [ ] `/` uses `trees-origin_v1.jpg` in both themes.
- [ ] Non-home routes retain their existing background behavior.
- [ ] Light mode reads as diffuse morning forest, not a flat cream or white page.
- [ ] Dark mode reads as the same forest at night and remains close to the current composition.
- [ ] Hero copy, page content, ordering, navigation, and authentication placement are unchanged.
- [ ] Hero, about copy, links, slider controls, status labels, and theme toggle remain legible in both themes.
- [ ] 320px, tablet, desktop, reduced-motion, persisted-theme, and no-View-Transition paths pass.
- [ ] Four visual baselines exist: desktop/mobile multiplied by light/dark.
- [ ] `npx nuxi typecheck`, `npm run build`, and `npm run test:e2e` pass.
