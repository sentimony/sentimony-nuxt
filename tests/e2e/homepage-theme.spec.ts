import { expect, test, type Page } from '@playwright/test'

const FOREST_MARKER = 'trees-origin'

async function openWithTheme(page: Page, theme: 'light' | 'dark', path = '/') {
  await page.addInitScript((initialTheme) => {
    if (localStorage.getItem('theme') === null) {
      localStorage.setItem('theme', initialTheme)
    }
  }, theme)
  await page.goto(path)
}

async function waitForForestReveal(page: Page) {
  await page.getByTestId('homepage-atmosphere').waitFor()
  await page.waitForFunction(
    () => document.documentElement.classList.contains('forest-ready'),
  )
}

async function waitForHomepageAssets(page: Page, _theme: 'light' | 'dark') {
  await waitForForestReveal(page)
  await page.evaluate(() => document.fonts.ready)
}

async function waitForHomepageHydration(page: Page) {
  await page.waitForFunction(() => {
    const button = document.querySelector('button[aria-label^="Switch to "]')
    if (!button) return false

    return Object.getOwnPropertySymbols(button).some((symbol) => {
      if (symbol.description !== '_vei') return false
      const handlers = Reflect.get(button, symbol) as { onClick?: unknown } | undefined
      return typeof handlers?.onClick === 'function'
    })
  })
}

async function readAtmosphereStyles(page: Page) {
  return page.getByTestId('homepage-atmosphere').evaluate((element) => {
    const imageLayer = getComputedStyle(element, '::before')
    return {
      backgroundImage: imageLayer.backgroundImage,
      opacity: imageLayer.opacity,
      filter: imageLayer.filter,
    }
  })
}

test('does not fetch the forest asset during first paint', async ({ page }) => {
  const forestRequests: string[] = []
  page.on('request', (request) => {
    if (request.url().includes(FOREST_MARKER)) {
      forestRequests.push(request.url())
    }
  })

  await openWithTheme(page, 'dark')

  // The background is inert until the deferred reveal fires: no request, no var.
  const initialVar = await page.locator('html').evaluate((element) => {
    return getComputedStyle(element).getPropertyValue('--forest-bg')
  })
  expect(initialVar.trim()).toBe('')
  expect(forestRequests).toHaveLength(0)

  await waitForForestReveal(page)

  // After the reveal exactly one asset is fetched, and it is the WebP variant.
  await expect.poll(() => forestRequests.length).toBe(1)
  expect(forestRequests[0]).toContain(FOREST_MARKER)
  expect(forestRequests[0]).toContain('webp')
})

test('reveals a single forest source that dims by theme on the homepage', async ({ page }) => {
  await openWithTheme(page, 'light')

  const atmosphere = page.getByTestId('homepage-atmosphere')
  await expect(atmosphere).toBeVisible()

  const body = page.locator('body')
  await expect(body).toHaveClass(/homepage-route/)
  const homeBackground = await body.evaluate((element) => {
    return getComputedStyle(element).backgroundImage
  })
  expect(homeBackground).toBe('none')

  await waitForForestReveal(page)

  const lightStyles = await readAtmosphereStyles(page)
  expect(lightStyles.backgroundImage).toContain(FOREST_MARKER)
  // The fade-in transition settles at the theme's target opacity.
  await expect.poll(async () => (await readAtmosphereStyles(page)).opacity).toBe('0.33')

  await page.getByRole('button', { name: 'Switch to dark theme' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)

  const darkStyles = await readAtmosphereStyles(page)
  expect(darkStyles.backgroundImage).toContain(FOREST_MARKER)
  await expect.poll(async () => (await readAtmosphereStyles(page)).opacity).toBe('0.17')

  await page.goto('/contacts')
  await expect(atmosphere).toHaveCount(0)
  await expect(body).not.toHaveClass(/homepage-route/)
})

test('persists selected theme across reload', async ({ page }) => {
  await openWithTheme(page, 'dark')
  await waitForHomepageHydration(page)

  await page.getByRole('button', { name: 'Switch to light theme' }).click()
  await expect(page.locator('html')).not.toHaveClass(/dark/)

  await page.reload()

  await expect(page.locator('html')).not.toHaveClass(/dark/)
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible()
})

test('loads only the approved forest asset on the homepage', async ({ page }) => {
  const cdpSession = await page.context().newCDPSession(page)
  await cdpSession.send('Network.setCacheDisabled', { cacheDisabled: true })
  await page.addInitScript(() => performance.setResourceTimingBufferSize(2_000))

  await openWithTheme(page, 'dark')
  await waitForForestReveal(page)

  const forestRequests = await page.evaluate((marker) => {
    return performance
      .getEntriesByType('resource')
      .map(entry => entry.name)
      .filter(name => name.includes(marker))
  }, FOREST_MARKER)

  expect(forestRequests).toHaveLength(1)
  expect(forestRequests[0]).toContain('webp')
})

test('keeps the homepage legible when the forest image is unavailable', async ({ page }) => {
  await page.route(url => url.href.includes(FOREST_MARKER), route => route.abort())
  await openWithTheme(page, 'light')

  await expect(page.getByTestId('homepage-hero')).toBeVisible()
  await expect(page.getByTestId('homepage-about')).toBeVisible()

  const fallbackColor = await page.getByTestId('homepage-atmosphere').evaluate((element) => {
    return getComputedStyle(element).backgroundColor
  })
  expect(fallbackColor).not.toBe('rgba(0, 0, 0, 0)')
})

test('uses theme foregrounds and stable read surfaces', async ({ page }) => {
  await openWithTheme(page, 'light')
  await waitForHomepageAssets(page, 'light')

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
  await expect(page.locator('html')).toHaveClass(/dark/)

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

test('switches instantly with reduced motion', async ({ page }) => {
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
  await waitForHomepageHydration(page)

  await page.getByRole('button', { name: 'Switch to light theme' }).click()

  await expect(page.locator('html')).not.toHaveClass(/dark/)
  const calls = await page.evaluate(() => {
    return (window as Window & { __viewTransitionCalls: number }).__viewTransitionCalls
  })
  expect(calls).toBe(0)
  await expect(page.locator('[data-fractal-orbit]')).toHaveCSS('animation-name', 'none')
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
  await waitForHomepageHydration(page)

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
    await expect(hero).toBeInViewport()

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(dimensions.scrollWidth).toBe(dimensions.clientWidth)
  })
}

for (const theme of ['light', 'dark'] as const) {
  test(`matches the approved ${theme} homepage treatment`, async ({ page }) => {
    await openWithTheme(page, theme)
    await waitForHomepageAssets(page, theme)

    await expect(page).toHaveScreenshot(`homepage-${theme}.png`, {
      animations: 'disabled',
      mask: [
        page.locator('.swiper-release'),
        page.locator('.swiper-artist'),
      ],
    })
  })
}
