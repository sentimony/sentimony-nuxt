import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const projectFile = (path: string) => fileURLToPath(new URL(`../../${path}`, import.meta.url))
const readProjectFile = (path: string) => readFileSync(projectFile(path), 'utf8')

const sections = ['releases', 'tracks', 'artists', 'videos', 'playlists', 'events']

describe('profile pages', () => {
  it('renders profile navigation around nested pages instead of local tabs', () => {
    const profilePage = readProjectFile('app/pages/profile.vue')

    expect(profilePage).toContain('<NuxtPage')
    expect(profilePage).not.toContain('activeTab')
    expect(profilePage).not.toContain('v-if="activeTab')
    expect(profilePage).toContain("label: 'Profile'")
    expect(profilePage).toContain("icon: 'lucide:square-user-round'")
    expect(profilePage).toContain('`/profile/${section.key}`')
  })

  it.each(sections)('defines /profile/%s as a separate page', (section) => {
    expect(existsSync(projectFile(`app/pages/profile/${section}.vue`))).toBe(true)
  })

  it('keeps /profile as an independent overview page', () => {
    const indexPage = readProjectFile('app/pages/profile/index.vue')

    expect(indexPage).not.toContain("navigateTo('/profile/")
    expect(indexPage).toContain('profileSections')
    expect(indexPage).toContain('`/profile/${section.key}`')
    expect(indexPage).toContain("lucide:arrow-right")
    expect(indexPage).toContain('Collection overview')
  })
})
