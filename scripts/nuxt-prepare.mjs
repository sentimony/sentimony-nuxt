import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const args = existsSync('.env.stage')
  ? ['--env-file=.env.stage', 'node_modules/.bin/nuxt', 'prepare']
  : ['node_modules/.bin/nuxt', 'prepare']

const result = spawnSync(process.execPath, args, { stdio: 'inherit' })

process.exit(result.status ?? 1)
