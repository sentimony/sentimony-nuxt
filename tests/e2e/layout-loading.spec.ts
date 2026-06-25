import { expect, test } from '@playwright/test'

test('does not mount catalog carousels on unrelated routes', async ({ page }) => {
  await page.goto('/contacts')

  await expect(page.locator('.swiper')).toHaveCount(0)
  await expect(page.locator('[class*="swiper-release"]')).toHaveCount(0)
  await expect(page.locator('[class*="swiper-artist"]')).toHaveCount(0)
})
