// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LazyIframe from '../../app/components/LazyIframe.vue'

const stubs = { Icon: true }

describe('LazyIframe', () => {
  it('renders a placeholder button when inactive (no iframe)', () => {
    const wrapper = mount(LazyIframe, {
      props: { active: false, src: 'https://example.com/embed', title: 'YouTube' },
      global: { stubs },
    })
    expect(wrapper.find('iframe').exists()).toBe(false)
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.find('button').attributes('aria-label')).toBe('Load YouTube player')
  })

  it('renders an iframe with the given src when active', () => {
    const wrapper = mount(LazyIframe, {
      props: { active: true, src: 'https://example.com/embed', title: 'YouTube' },
      global: { stubs },
    })
    expect(wrapper.find('iframe').exists()).toBe(true)
    expect(wrapper.find('iframe').attributes('src')).toBe('https://example.com/embed')
    expect(wrapper.find('iframe').attributes('title')).toBe('YouTube')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('emits "request-activate" when the placeholder button is clicked', async () => {
    const wrapper = mount(LazyIframe, {
      props: { active: false, src: 'https://example.com/embed', title: 'YouTube' },
      global: { stubs },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('request-activate')).toBeTruthy()
    expect(wrapper.emitted('request-activate')!.length).toBe(1)
  })
})
