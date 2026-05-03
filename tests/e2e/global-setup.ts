import { config as loadDotenv } from 'dotenv'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { getAdminClient, TEST_USER_EMAIL_PREFIX } from './helpers/supabase-admin'

loadDotenv({ path: '.env.stage' })

export default async function globalSetup() {
  if (!process.env.E2E_TEST_RELEASE_SLUG) {
    console.log('[e2e] E2E_TEST_RELEASE_SLUG not set — skipping user creation (auth tests will skip)')
    return
  }

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
