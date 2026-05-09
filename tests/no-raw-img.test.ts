import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'

const APP_DIR = resolve(__dirname, '../app')

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) yield* walk(full)
    else yield full
  }
}

describe('no raw <img> tags in app/', () => {
  it('returns no matches for <img\\s', () => {
    const offenders: string[] = []
    for (const file of walk(APP_DIR)) {
      const src = readFileSync(file, 'utf8')
      if (/<img\s/.test(src)) offenders.push(file)
    }
    expect(offenders).toEqual([])
  })

  it('returns no matches for any <img token', () => {
    const offenders: string[] = []
    for (const file of walk(APP_DIR)) {
      const src = readFileSync(file, 'utf8')
      if (/<img[\s/>]/.test(src)) offenders.push(file)
    }
    expect(offenders).toEqual([])
  })
})
