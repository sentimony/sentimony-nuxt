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
