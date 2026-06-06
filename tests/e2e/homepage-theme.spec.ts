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
