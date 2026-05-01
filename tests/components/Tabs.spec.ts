import { describe, it, expect } from 'vitest'
import { mountWithStubs } from '../utils/mountWithStubs'
import Tabs from '~/components/Tabs.vue'
import Tab from '~/components/Tab.vue'

const TabsHarness = {
  components: { Tabs, Tab },
  template: `
    <Tabs>
      <Tab title="A">Content A</Tab>
      <Tab title="B">Content B</Tab>
      <Tab title="C">Content C</Tab>
    </Tabs>
  `,
}

describe('Tabs.vue', () => {
  it('перший таб селектний при першому рендері', async () => {
    const wrapper = await mountWithStubs(TabsHarness)
    const buttons = wrapper.findAll('[role="tab"]')

    expect(buttons).toHaveLength(3)
    expect(buttons[0]?.attributes('aria-selected')).toBe('true')
    expect(buttons[1]?.attributes('aria-selected')).toBe('false')
    expect(buttons[2]?.attributes('aria-selected')).toBe('false')
  })

  it('клік по табу робить його активним', async () => {
    const wrapper = await mountWithStubs(TabsHarness)
    const buttons = wrapper.findAll('[role="tab"]')

    await buttons[2]?.trigger('click')

    expect(buttons[0]?.attributes('aria-selected')).toBe('false')
    expect(buttons[2]?.attributes('aria-selected')).toBe('true')
  })

  it('ArrowRight циклічно перемикає вперед, з останнього на перший', async () => {
    const wrapper = await mountWithStubs(TabsHarness)
    const buttons = wrapper.findAll('[role="tab"]')

    await buttons[0]?.trigger('keydown', { key: 'ArrowRight' })
    expect(buttons[1]?.attributes('aria-selected')).toBe('true')

    await buttons[1]?.trigger('keydown', { key: 'ArrowRight' })
    expect(buttons[2]?.attributes('aria-selected')).toBe('true')

    await buttons[2]?.trigger('keydown', { key: 'ArrowRight' })
    expect(buttons[0]?.attributes('aria-selected')).toBe('true')
  })

  it('ArrowLeft циклічно перемикає назад, з першого на останній', async () => {
    const wrapper = await mountWithStubs(TabsHarness)
    const buttons = wrapper.findAll('[role="tab"]')

    await buttons[0]?.trigger('keydown', { key: 'ArrowLeft' })
    expect(buttons[2]?.attributes('aria-selected')).toBe('true')

    await buttons[2]?.trigger('keydown', { key: 'ArrowLeft' })
    expect(buttons[1]?.attributes('aria-selected')).toBe('true')
  })

  it('Home переходить на перший, End — на останній', async () => {
    const wrapper = await mountWithStubs(TabsHarness)
    const buttons = wrapper.findAll('[role="tab"]')

    await buttons[0]?.trigger('click')
    await buttons[0]?.trigger('keydown', { key: 'End' })
    expect(buttons[2]?.attributes('aria-selected')).toBe('true')

    await buttons[2]?.trigger('keydown', { key: 'Home' })
    expect(buttons[0]?.attributes('aria-selected')).toBe('true')
  })

  it('tabindex керований: 0 для активного, -1 для решти', async () => {
    const wrapper = await mountWithStubs(TabsHarness)
    const buttons = wrapper.findAll('[role="tab"]')

    expect(buttons[0]?.attributes('tabindex')).toBe('0')
    expect(buttons[1]?.attributes('tabindex')).toBe('-1')
    expect(buttons[2]?.attributes('tabindex')).toBe('-1')

    await buttons[1]?.trigger('click')
    expect(buttons[0]?.attributes('tabindex')).toBe('-1')
    expect(buttons[1]?.attributes('tabindex')).toBe('0')
  })
})
