import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import { createTabsContext } from '../../app/utils/tabs'

const projectFile = (path: string) => fileURLToPath(new URL(`../../${path}`, import.meta.url))
const readProjectFile = (path: string) => readFileSync(projectFile(path), 'utf8')

describe('createTabsContext', () => {
  it('activates only the first registered tab initially', () => {
    const context = createTabsContext()
    const firstId = context.registerTab({ title: 'Sentimony' })
    const secondId = context.registerTab({ title: 'Bandcamp' })

    expect(context.selected.value).toBe(firstId)
    expect(context.isActivated(firstId)).toBe(true)
    expect(context.isActivated(secondId)).toBe(false)
  })

  it('keeps a selected tab activated after switching away', async () => {
    const context = createTabsContext()
    const firstId = context.registerTab({ title: 'Sentimony' })
    const secondId = context.registerTab({ title: 'Bandcamp' })

    context.selected.value = secondId
    await nextTick()
    context.selected.value = firstId
    await nextTick()

    expect(context.isActivated(firstId)).toBe(true)
    expect(context.isActivated(secondId)).toBe(true)
  })

  it('removes stale activation and activates the fallback selection', () => {
    const context = createTabsContext()
    const firstId = context.registerTab({ title: 'YouTube' })
    const secondId = context.registerTab({ title: 'SoundCloud' })

    context.unregisterTab(firstId)

    expect(context.selected.value).toBe(secondId)
    expect(context.isActivated(firstId)).toBe(false)
    expect(context.isActivated(secondId)).toBe(true)
  })
})

describe('lazy tab component wiring', () => {
  const tabs = readProjectFile('app/components/Tabs.vue')
  const tab = readProjectFile('app/components/Tab.vue')

  it('provides the shared activation context', () => {
    expect(tabs).toContain('createTabsContext()')
    expect(tabs).toContain('provide(tabsKey, tabsContext)')
    expect(tabs).toContain(':unmount-on-hide="false"')
  })

  it('mounts slot content only after its tab is activated', () => {
    expect(tab).toContain('inject(tabsKey)')
    expect(tab).toContain('tabs?.isActivated(id)')
    expect(tab).toContain('<slot v-if="isActivated" />')
  })
})
