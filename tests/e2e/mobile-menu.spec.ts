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
