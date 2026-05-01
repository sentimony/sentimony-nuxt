import { describe, it, expect } from 'vitest'
import { mountWithStubs } from '../utils/mountWithStubs'
import OpenSidebar from '~/components/OpenSidebar.vue'

describe('OpenSidebar.vue', () => {
  it('закрита за замовчуванням, body unlocked, panel inert', async () => {
    const wrapper = await mountWithStubs(OpenSidebar)

    expect(document.body.style.overflow).toBe('')
    const panel = wrapper.find('#mobile-sidebar')
    expect(panel.exists()).toBe(true)
    expect(panel.attributes('inert')).toBeDefined()
  })

  it('toggle button відкриває sidebar і блокує body-scroll', async () => {
    const wrapper = await mountWithStubs(OpenSidebar)

    const toggle = wrapper.find('button[aria-controls="mobile-sidebar"]')
    expect(toggle.exists()).toBe(true)
    expect(toggle.attributes('aria-expanded')).toBe('false')

    await toggle.trigger('click')

    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(document.body.style.overflow).toBe('hidden')
    expect(wrapper.find('#mobile-sidebar').attributes('inert')).toBeUndefined()
  })

  it('Esc закриває відкритий sidebar і знімає scroll-lock', async () => {
    const wrapper = await mountWithStubs(OpenSidebar)
    const toggle = wrapper.find('button[aria-controls="mobile-sidebar"]')

    await toggle.trigger('click')
    expect(document.body.style.overflow).toBe('hidden')

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()

    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(document.body.style.overflow).toBe('')
  })

  it('panel має role="dialog" + aria-modal + aria-label', async () => {
    const wrapper = await mountWithStubs(OpenSidebar)
    const panel = wrapper.find('#mobile-sidebar')

    expect(panel.attributes('role')).toBe('dialog')
    expect(panel.attributes('aria-modal')).toBe('true')
    expect(panel.attributes('aria-label')).toBeTruthy()
  })
})
