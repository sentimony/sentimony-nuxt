import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

describe('inline background-image utilities', () => {
  it('no bg-[url(...)] usage anywhere in app/', () => {
    let out = ''
    try {
      out = execSync(`grep -rE "bg-\\[url\\(" app/`, { encoding: 'utf8' }).trim()
    } catch (e: any) {
      out = (e.stdout || '').toString().trim()
    }
    expect(out, `Unexpected bg-[url] occurrences:\n${out}`).toBe('')
  })

  it('no inline background-image / background:url(...) in app/', () => {
    let out = ''
    try {
      out = execSync(`grep -rE "background-image|background:.*url\\(" app/`, { encoding: 'utf8' }).trim()
    } catch (e: any) {
      out = (e.stdout || '').toString().trim()
    }
    expect(out, `Unexpected background-image:\n${out}`).toBe('')
  })
})
