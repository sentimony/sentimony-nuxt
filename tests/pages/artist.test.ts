// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import LazyIframe from '../../app/components/LazyIframe.vue'

const pageSrc = readFileSync(resolve(__dirname, '../../app/pages/artist/[id].vue'), 'utf8')

describe('pages/artist/[id].vue', () => {
  it('uses useTabState with key "artist" and default "youtube"', () => {
    expect(pageSrc).toMatch(/useTabState\(\s*['"]artist['"]\s*,\s*['"]youtube['"]\s*\)/)
  })

  it('builds availableTabs with youtube + soundcloud platforms', () => {
    expect(pageSrc).toMatch(/platform:\s*['"]youtube['"]/)
    expect(pageSrc).toMatch(/platform:\s*['"]soundcloud['"]/)
  })

  it('renders single LazyIframe via v-if gating on effectiveTab', () => {
    expect(pageSrc).toMatch(/v-if="t\.platform === effectiveTab"/)
    expect(pageSrc).toMatch(/<LazyIframe[\s\S]*?:active="true"/)
  })

  it('falls back to first available tab when activeTab is not in list', () => {
    expect(pageSrc).toMatch(/effectiveTab\s*=\s*computed/)
    expect(pageSrc).toMatch(/platforms\.includes\(activeTab\.value\)/)
  })

  it('passes platform-specific iframe attrs (allow, allowfullscreen, iframeClass)', () => {
    expect(pageSrc).toMatch(/allowfullscreen:\s*true/)
    expect(pageSrc).toMatch(/iframeClass:\s*['"]border-\[0px\] aspect-video w-full['"]/)
    expect(pageSrc).toMatch(/iframeClass:\s*['"]border-\[0px\] w-full h-\[300px\]['"]/)
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
