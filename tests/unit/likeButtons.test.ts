import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const projectFile = (path: string) => fileURLToPath(new URL(`../../${path}`, import.meta.url))
const readProjectFile = (path: string) => readFileSync(projectFile(path), 'utf8')

const likePages = [
  'app/pages/artist/[id].vue',
  'app/pages/event/[id].vue',
  'app/pages/release/[id].vue',
  'app/pages/track/[id].vue',
  'app/pages/playlist/[id].vue',
  'app/pages/video/[id].vue',
]

describe('like buttons', () => {
  it.each(likePages)('uses thumbs-up on %s', (path) => {
    const page = readProjectFile(path)

    expect(page).toContain('lucide:thumbs-up')
    expect(page).not.toContain('lucide:heart')
  })
})
