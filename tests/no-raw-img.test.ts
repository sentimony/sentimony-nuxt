import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

describe('app/ has no raw <img> tags', () => {
  it('grep -rE "<img\\s" app/ returns nothing', () => {
    let out = ''
    try {
      out = execSync(`grep -rE "<img\\s" app/`, { encoding: 'utf8' }).trim()
    } catch (e: any) {
      out = (e.stdout || '').toString().trim()
    }
    expect(out, `Unexpected raw <img> tags:\n${out}`).toBe('')
  })
})
