# Lazy Media Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Load only the configured initial media tab until another tab is clicked, and remove volume and total-duration controls from the inline Sentimony players.

**Architecture:** Extract tab registration and activation into a small Vue-backed context with a typed injection key. `Tabs` owns this context and `Tab` gates only its slot content, allowing the selected iframe to mount once and remain mounted after later tab switches. The two inline audio components are simplified independently, leaving the global bottom player unchanged.

**Tech Stack:** Nuxt 4, Vue 3 Composition API, reka-ui tabs, TypeScript, Vitest 4.

## Global Constraints

- The first registered tab is selected and mounted immediately.
- Every later tab remains unmounted until the user selects it.
- Once selected, tab content stays mounted across later switches.
- Remove volume controls and total-duration output only from `AudioTrackPlaylist` and `AudioMixPlayer`.
- Keep play/pause, seek, elapsed time, track navigation, and the global bottom player behavior unchanged.
- Do not add dependencies or page-specific iframe conditions.
- Do not run any `sync:*` command.
- Avoid code comments; any necessary code comment must be in English.

---

## File Structure

- Create `app/utils/tabs.ts`: typed tab metadata, injection key, registration, selection, and persistent activation state.
- Modify `app/components/Tabs.vue`: consume the shared tab context and provide it to child tabs.
- Modify `app/components/Tab.vue`: register through the typed context and mount its slot only after activation.
- Create `tests/unit/tabs.test.ts`: behavioral coverage for initial activation, click activation persistence, unregistering, and component wiring.
- Modify `app/components/AudioTrackPlaylist.vue`: remove inline volume UI and total-duration text.
- Modify `app/components/AudioMixPlayer.vue`: remove inline volume UI and total-duration text.
- Modify `tests/unit/audioTrackPlaylist.test.ts`: assert the simplified track-player controls.
- Modify `tests/unit/audioMixPlayer.test.ts`: assert the simplified mix-player controls and unchanged global controls.

---

### Task 1: Persistent lazy tab activation

**Files:**

- Create: `app/utils/tabs.ts`
- Modify: `app/components/Tabs.vue`
- Modify: `app/components/Tab.vue`
- Create: `tests/unit/tabs.test.ts`

**Interfaces:**

- Consumes: Vue `reactive`, `ref`, `watch`, `InjectionKey`, and `Ref`; existing reka-ui `TabsRoot`, `TabsContent`, and `TabsTrigger` auto-imports.
- Produces: `tabsKey: InjectionKey<TabsContext>` and `createTabsContext(): TabsContext`, where `TabsContext` exposes `tabs`, `selected`, `registerTab`, `unregisterTab`, and `isActivated`.

- [ ] **Step 1: Write the failing context and component-wiring tests**

Create `tests/unit/tabs.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm run test:unit -- tests/unit/tabs.test.ts
```

Expected: FAIL because `app/utils/tabs.ts` does not exist and the shared activation context is not implemented.

- [ ] **Step 3: Implement the typed activation context**

Create `app/utils/tabs.ts`:

```ts
import { reactive, ref, watch } from 'vue'
import type { InjectionKey, Ref } from 'vue'

export type TabInfo = { title?: string, icon?: string, img?: string }
export type TabRecord = { id: number, info: TabInfo }

export type TabsContext = {
  tabs: TabRecord[]
  selected: Ref<number | undefined>
  registerTab: (info: TabInfo) => number
  unregisterTab: (id: number) => void
  isActivated: (id: number) => boolean
}

export const tabsKey = Symbol('tabs') as InjectionKey<TabsContext>

export function createTabsContext(): TabsContext {
  const tabs = reactive<TabRecord[]>([])
  const selected = ref<number | undefined>()
  const activatedTabIds = reactive(new Set<number>())
  let idCounter = 0

  function activate(id?: number) {
    if (id != null) activatedTabIds.add(id)
  }

  function registerTab(info: TabInfo): number {
    const id = idCounter++
    tabs.push({ id, info })
    if (selected.value == null) {
      selected.value = id
      activate(id)
    }
    return id
  }

  function unregisterTab(id: number) {
    const index = tabs.findIndex(tab => tab.id === id)
    if (index !== -1) tabs.splice(index, 1)
    activatedTabIds.delete(id)
    if (selected.value === id) {
      selected.value = tabs[0]?.id
      activate(selected.value)
    }
  }

  watch(selected, activate)

  return {
    tabs,
    selected,
    registerTab,
    unregisterTab,
    isActivated: id => activatedTabIds.has(id),
  }
}
```

- [ ] **Step 4: Wire `Tabs.vue` to the shared context**

Replace its local tab registry with:

```ts
<script setup lang="ts">
import { computed, provide } from 'vue'
import { createTabsContext, tabsKey } from '~/utils/tabs'

const tabsContext = createTabsContext()
const { tabs, selected } = tabsContext

provide(tabsKey, tabsContext)

const hideTitles = computed(() => tabs.length >= 5)

function plainTitle(title?: string) {
  return title ? title.replace(/<[^>]+>/g, '') : undefined
}
</script>
```

Keep the existing template, including `<TabsRoot v-model="selected" :unmount-on-hide="false">`.

- [ ] **Step 5: Gate the `Tab.vue` slot through the shared context**

Replace its script with:

```ts
<script setup lang="ts">
import { computed, inject, onBeforeUnmount, reactive, watch } from 'vue'
import { tabsKey } from '~/utils/tabs'

const props = defineProps<{
  title?: string
  icon?: string
  img?: string
}>()

const tabs = inject(tabsKey)
const info = reactive({ title: props.title, icon: props.icon, img: props.img })
const id = tabs?.registerTab(info)
const isActivated = computed(() => id != null && Boolean(tabs?.isActivated(id)))

watch(() => props.title, (value) => { info.title = value })
watch(() => props.icon, (value) => { info.icon = value })
watch(() => props.img, (value) => { info.img = value })

onBeforeUnmount(() => {
  if (id != null) tabs?.unregisterTab(id)
})
</script>
```

Change only the slot line in the existing template:

```vue
<slot v-if="isActivated" />
```

- [ ] **Step 6: Run the focused test and verify GREEN**

Run:

```bash
npm run test:unit -- tests/unit/tabs.test.ts
```

Expected: PASS, 1 test file and 5 tests passed.

- [ ] **Step 7: Commit the lazy-tab behavior**

```bash
git add app/utils/tabs.ts app/components/Tabs.vue app/components/Tab.vue tests/unit/tabs.test.ts
git commit -m "perf: lazily mount media tabs"
```

---

### Task 2: Simplify inline Sentimony player controls

**Files:**

- Modify: `app/components/AudioTrackPlaylist.vue`
- Modify: `app/components/AudioMixPlayer.vue`
- Modify: `tests/unit/audioTrackPlaylist.test.ts`
- Modify: `tests/unit/audioMixPlayer.test.ts`

**Interfaces:**

- Consumes: existing `useAudioPlayer()` playback, duration, seek, queue, and track-count APIs.
- Produces: inline players with elapsed time and seek controls but no local volume control or total-duration label; the global player continues to expose both.

- [ ] **Step 1: Replace the track-player control assertions with failing simplified-control assertions**

In `tests/unit/audioTrackPlaylist.test.ts`, replace the duration-formatting test with:

```ts
it('shows elapsed time and seek without inline volume or total duration', () => {
  expect(component).toContain('formatDuration(isActive ? currentTime : 0)')
  expect(component).toContain('@input="onSeek"')
  expect(component).not.toContain('formatDuration(isActive ? duration : 0)')
  expect(component).not.toContain('lucide:volume-2')
  expect(component).not.toContain('setVolume')
})
```

Keep the existing `font-mono` assertion because elapsed time remains technical data.

- [ ] **Step 2: Replace the mix-player control assertions and protect the global player**

In `tests/unit/audioMixPlayer.test.ts`, define the bottom-player source beside the existing component source:

```ts
const bottomPlayer = readProjectFile('app/components/AudioBottomPlayer.vue')
```

Replace the duration-formatting test with:

```ts
it('shows elapsed time and seek without inline volume or total duration', () => {
  expect(component).toContain('formatDuration(active ? currentTime : 0)')
  expect(component).toContain('@input="onSeek"')
  expect(component).not.toContain('formatDuration(active ? duration : 0)')
  expect(component).not.toContain('lucide:volume-2')
  expect(component).not.toContain('setVolume')
})

it('leaves volume and total duration in the global bottom player', () => {
  expect(bottomPlayer).toContain('lucide:volume-2')
  expect(bottomPlayer).toContain('formatDuration(duration)')
  expect(bottomPlayer).toContain('setVolume')
})
```

Keep the existing `font-mono` assertion.

- [ ] **Step 3: Run both focused tests and verify RED**

Run:

```bash
npm run test:unit -- tests/unit/audioTrackPlaylist.test.ts tests/unit/audioMixPlayer.test.ts
```

Expected: FAIL because both inline components still render total duration and volume controls.

- [ ] **Step 4: Remove volume handling and total-duration output from `AudioTrackPlaylist.vue`**

Change the player destructuring to:

```ts
const { current, isPlaying, currentTime, duration, play, toggle, seek, next, prev } = useAudioPlayer()
```

Delete the complete `onVolumeChange` function:

```ts
function onVolumeChange(event: Event) {
  setVolume(Number((event.target as HTMLInputElement).value))
}
```

In the seek row, delete:

```vue
<span class="font-mono text-xs w-10">{{ formatDuration(isActive ? duration : 0) }}</span>
```

Delete the complete volume row containing `lucide:volume-2` and the range input bound to `volume`. Keep `duration` in the script because the seek input still uses it as `max`.

- [ ] **Step 5: Remove volume handling and total-duration output from `AudioMixPlayer.vue`**

Change the player destructuring to:

```ts
const { isPlaying, currentTime, duration, play, toggle, seek, isCurrent } = useAudioPlayer()
```

Delete the complete `onVolumeChange` function, the total-duration `<span>`, and the complete volume row. Keep `duration` for the seek input maximum.

- [ ] **Step 6: Run both focused tests and verify GREEN**

Run:

```bash
npm run test:unit -- tests/unit/audioTrackPlaylist.test.ts tests/unit/audioMixPlayer.test.ts
```

Expected: PASS, 2 test files with no failed tests.

- [ ] **Step 7: Commit the inline-player simplification**

```bash
git add app/components/AudioTrackPlaylist.vue app/components/AudioMixPlayer.vue tests/unit/audioTrackPlaylist.test.ts tests/unit/audioMixPlayer.test.ts
git commit -m "refactor: simplify inline audio controls"
```

---

### Task 3: Full verification

**Files:**

- Verify: all changed files from Tasks 1 and 2.

**Interfaces:**

- Consumes: completed lazy-tab context and simplified inline players.
- Produces: fresh unit, type, and whitespace evidence for handoff.

- [ ] **Step 1: Run the complete unit suite**

Run:

```bash
npm run test:unit
```

Expected: all Vitest files and tests pass with zero failures.

- [ ] **Step 2: Run Nuxt/Nitro type checking**

Run:

```bash
npx nuxi typecheck
```

Expected: exit code 0. Existing local warnings about absent Supabase environment variables are acceptable.

- [ ] **Step 3: Check the final diff for whitespace and scope**

Run:

```bash
git diff --check HEAD~2..HEAD
git status --short
```

Expected: `git diff --check` exits 0; status contains no uncommitted files from this implementation. Preserve and report any unrelated pre-existing user changes rather than modifying them.

- [ ] **Step 4: Review requirements against the final diff**

Confirm all five statements directly from the diff and test output:

1. The first configured tab mounts immediately.
2. Later tabs mount only after selection and remain mounted afterward.
3. Both inline players omit volume and total-duration controls.
4. Elapsed time, seek, and existing playback navigation remain.
5. `AudioBottomPlayer.vue` is unchanged and retains its controls.
