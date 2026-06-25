import { expect, test, type Page } from '@playwright/test'

const forestUrls = {
  light: 'https://content.sentimony.com/assets/img/backgrounds/trees-light_v1.jpg',
  dark: 'https://content.sentimony.com/assets/img/backgrounds/trees-dark_v1.jpg',
} as const

async function openWithTheme(page: Page, theme: 'light' | 'dark', path = '/') {
  await page.addInitScript((initialTheme) => {
    if (localStorage.getItem('theme') === null) {
      localStorage.setItem('theme', initialTheme)
    }
  }, theme)
  await page.goto(path)
}

async function waitForHomepageAssets(page: Page, theme: 'light' | 'dark') {
  await page.getByTestId('homepage-atmosphere').waitFor()
  await page.evaluate(async (urls) => {
    await Promise.all([
      ...urls.map((url) => {
        const image = new Image()
        image.src = url
        return image.decode()
      }),
      document.fonts.ready,
    ])
  }, [forestUrls[theme], forestUrls.dark])
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
      filter: imageLayer.filter,
    }
  })
}

test('uses theme-specific forest sources only on the homepage', async ({ page }) => {
  const forestRequests: string[] = []
  page.on('request', (request) => {
    const url = request.url()
    if (url.includes('/backgrounds/trees-')) {
      forestRequests.push(url)
    }
  })

  await openWithTheme(page, 'light')

  const atmosphere = page.getByTestId('homepage-atmosphere')
  await expect(atmosphere).toBeVisible()

  const body = page.locator('body')
  await expect(body).toHaveClass(/homepage-route/)
  const homeBackground = await body.evaluate((element) => {
    return getComputedStyle(element).backgroundImage
  })
  expect(homeBackground).toBe('none')

  const lightStyles = await readAtmosphereStyles(page)
  expect(lightStyles.backgroundImage).toContain(forestUrls.light)
  expect(forestRequests).not.toContain(forestUrls.dark)

  await page.getByRole('button', { name: 'Switch to dark theme' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)

  const darkStyles = await readAtmosphereStyles(page)
  expect(darkStyles.backgroundImage).toContain(forestUrls.dark)
  expect(darkStyles.backgroundImage).not.toContain(forestUrls.light)
  await expect.poll(() => [...forestRequests].sort()).toEqual(
    [forestUrls.light, forestUrls.dark].sort(),
  )

  await page.goto('/contacts')
  await expect(atmosphere).toHaveCount(0)
  await expect(body).not.toHaveClass(/homepage-route/)
  const nonHomeBackground = await page.locator('html').evaluate((element) => {
    return getComputedStyle(element, '::before').backgroundImage
  })
  expect(nonHomeBackground).toContain('trees-dark_v1')
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
  await waitForHomepageAssets(page, 'dark')
  await page.waitForFunction((urls) => {
    const names = performance.getEntriesByType('resource').map(entry => entry.name)
    return urls.every(url => names.includes(url))
  }, [forestUrls.dark])

  const forestRequests = await page.evaluate(() => {
    return performance
      .getEntriesByType('resource')
      .map(entry => entry.name)
      .filter(name => name.includes('/backgrounds/trees-'))
  })

  expect([...forestRequests].sort()).toEqual([forestUrls.dark].sort())
})

test('keeps the homepage legible when the forest image is unavailable', async ({ page }) => {
  await page.route(forestUrls.light, route => route.abort())
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
