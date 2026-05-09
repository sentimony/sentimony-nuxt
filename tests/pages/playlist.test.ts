// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import LazyIframe from '../../app/components/LazyIframe.vue'

const pageSrc = readFileSync(resolve(__dirname, '../../app/pages/playlist/[id].vue'), 'utf8')

describe('pages/playlist/[id].vue', () => {
  it('uses useTabState with key "playlist" and default "youtube"', () => {
    expect(pageSrc).toMatch(/useTabState\(\s*['"]playlist['"]\s*,\s*['"]youtube['"]\s*\)/)
  })

  it('builds an availableTabs list with youtube/soundcloud/youtubemusic platforms', () => {
    expect(pageSrc).toMatch(/platform:\s*['"]youtube['"]/)
    expect(pageSrc).toMatch(/platform:\s*['"]soundcloud['"]/)
    expect(pageSrc).toMatch(/platform:\s*['"]youtubemusic['"]/)
  })

  it('renders exactly one LazyIframe via v-if gating on activeTab', () => {
    expect(pageSrc).toMatch(/v-if="t\.platform === activeTab"/)
    expect(pageSrc).toMatch(/<LazyIframe[\s\S]*?:active="true"/)
  })

  it('contains no raw <iframe> tag', () => {
    expect(pageSrc).not.toMatch(/<iframe\b/)
  })

  it('wraps the iframe section in <ClientOnly>', () => {
    expect(pageSrc).toMatch(/<ClientOnly>/)
  })

  it('LazyIframe mounts exactly one <iframe> when active=true', () => {
    const wrapper = mount(LazyIframe, {
      props: { active: true, src: 'https://example.com/embed', title: 'YouTube' },
      global: { stubs: { Icon: true } },
    })
    expect(wrapper.findAll('iframe')).toHaveLength(1)
  })
})
