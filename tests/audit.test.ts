import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const audit = readFileSync(resolve(__dirname, '../docs/iframe-audit.md'), 'utf8')

describe('iframe-audit.md', () => {
  it('documents release with 4 iframes', () => {
    expect(audit).toMatch(/release\/\[id\]\.vue\s+—\s+4\s+iframes/)
  })
  it('documents artist with 2 iframes', () => {
    expect(audit).toMatch(/artist\/\[id\]\.vue\s+—\s+2\s+iframes/)
  })
  it('documents playlist with 3 iframes', () => {
    expect(audit).toMatch(/playlist\/\[id\]\.vue\s+—\s+3\s+iframes/)
  })
  it('documents video with 1 iframe', () => {
    expect(audit).toMatch(/video\/\[id\]\.vue\s+—\s+1\s+iframe/)
  })
})
