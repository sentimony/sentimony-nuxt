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
  await page.waitForLoadState('networkidle')

  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: 'Sign In', exact: true }).click()

  await page.waitForURL('/profile', { timeout: 20_000 })
}
