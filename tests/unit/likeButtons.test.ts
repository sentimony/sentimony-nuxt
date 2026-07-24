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
  it.each(likePages)('uses a thumbs-up like control on %s', (path) => {
    const page = readProjectFile(path)

    // Detail pages either inline the icon or use the shared <LikeButton> wrapper.
    expect(page.includes('lucide:thumbs-up') || page.includes('<LikeButton')).toBe(true)
    expect(page).not.toContain('lucide:heart')
  })

  it('renders thumbs-up inside the shared LikeButton', () => {
    expect(readProjectFile('app/components/buttons/LikeButton.vue')).toContain('lucide:thumbs-up')
  })
})
