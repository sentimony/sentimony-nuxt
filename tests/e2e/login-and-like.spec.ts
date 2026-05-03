import { test, expect } from '@playwright/test'
import { loginViaUI, loadFixture } from './helpers/auth'
import { getAdminClient } from './helpers/supabase-admin'

const RELEASE_SLUG = process.env.E2E_TEST_RELEASE_SLUG

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
    await expect(page).toHaveURL(new RegExp(`/release/${RELEASE_SLUG}`))
    await page.waitForResponse(r => r.url().includes(`/api/likes/count/${RELEASE_SLUG}`), { timeout: 10_000 }).catch(() => {})

    const likeBtn = () => page.getByRole('button', { name: /^Like$/ })
    const likedBtn = () => page.getByRole('button', { name: /^Liked/ })

    await expect(likeBtn()).toBeVisible()

    const likePost = page.waitForResponse(r => r.url().includes('/api/likes') && r.request().method() === 'POST')
    await likeBtn().click()
    await likePost
    await expect(likedBtn()).toBeVisible({ timeout: 5_000 })

    await page.reload()
    await expect(likedBtn()).toBeVisible({ timeout: 5_000 })

    const likeDelete = page.waitForResponse(r => r.url().includes('/api/likes') && r.request().method() === 'DELETE')
    await likedBtn().click()
    await likeDelete
    await expect(likeBtn()).toBeVisible({ timeout: 5_000 })
  })
})
