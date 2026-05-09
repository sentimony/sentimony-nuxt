// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import LazyIframe from '../../app/components/LazyIframe.vue'

const pageSrc = readFileSync(resolve(__dirname, '../../app/pages/video/[id].vue'), 'utf8')

describe('pages/video/[id].vue', () => {
  it('uses useTabState with key "video" and default "youtube"', () => {
    expect(pageSrc).toMatch(/useTabState\(\s*['"]video['"]\s*,\s*['"]youtube['"]\s*\)/)
  })

  it('uses LazyIframe for the YouTube embed and no raw <iframe>', () => {
    expect(pageSrc).toMatch(/<LazyIframe[\s\S]*?:active="activeTab === 'youtube'"/)
    expect(pageSrc).not.toMatch(/<iframe\b/)
  })

  it('LazyIframe renders exactly one <iframe> when active=true', () => {
    const wrapper = mount(LazyIframe, {
      props: { active: true, src: 'https://example.com/embed', title: 'YouTube' },
      global: { stubs: { Icon: true } },
    })
    expect(wrapper.findAll('iframe')).toHaveLength(1)
  })

  it('LazyIframe renders zero <iframe> when active=false', () => {
    const wrapper = mount(LazyIframe, {
      props: { active: false, src: 'https://example.com/embed', title: 'YouTube' },
      global: { stubs: { Icon: true } },
    })
    expect(wrapper.findAll('iframe')).toHaveLength(0)
  })
})
