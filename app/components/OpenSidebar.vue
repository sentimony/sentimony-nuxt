<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { getNav, isNavActive as _navActive } from '~/constants/nav'
import { getSocials } from '~/constants/soclinks'
import { getIcon } from '~/constants/icons'
const route = useRoute()
const isNavActive = (link: string) => _navActive(route.path, link)

const isOpen = ref(false)

const soc = computed(() =>
  getSocials({ inHeader: true }).map(l => ({ ...l, icon: getIcon(l.id) }))
)

watch(() => route.path, () => { isOpen.value = false })
</script>

<template>
  <DialogRoot v-model:open="isOpen">

    <button
      type="button"
      aria-label="Menu"
      :aria-expanded="isOpen"
      class="fixed top-0 right-0 mr-2 mt-[9px] z-50 flex items-center justify-center transition ease-in-out duration-300 cursor-pointer rounded-[2px] hover:bg-white/30 size-[56px]"
      :class="isOpen ? 'bg-white/20 rotate-[360deg]' : ''"
      @click="isOpen = !isOpen"
      v-wave
    >
      <Icon
        name="fa7-solid:navicon"
        size="22"
        :class="isOpen ? 'hidden' : ''"
      />
      <Icon
        name="fa7-solid:close"
        size="22"
        :class="isOpen ? '' : 'hidden'"
      />
    </button>

    <DialogPortal>
      <DialogOverlay class="reka-fade fixed inset-0 z-30 bg-black/30 backdrop-blur-sm" />

      <DialogContent
        class="drawer fixed left-full w-[256px] h-screen top-0 z-40 flex flex-col bg-black/60 pt-2 focus:outline-none"
      >
        <VisuallyHidden>
          <DialogTitle>Menu</DialogTitle>
        </VisuallyHidden>

        <NuxtLink
          v-for="i in getNav()"
          :key="i.route"
          :to="i.route"
          class="flex items-center justify-center h-12 hover:bg-white/15 text-base transition-background duration-300 ease-in-out"
          :class="isNavActive(i.route) ? 'bg-white/10' : ''"
          v-wave
        >
          {{ i.title }}
        </NuxtLink>

        <hr class="border-white/30 my-2" />

        <div class="flex flex-wrap">
          <a
            v-for="i in soc"
            :href="i.url"
            class="flex flex-row items-center h-12 justify-center hover:bg-white/15 transition-background duration-300 ease-in-out w-full text-[12px]"
            target="_blank" rel="noopener"
            v-wave
          >
            <Icon v-if="i.icon.kind === 'iconify'" :name="i.icon.name" size="20" />
            <img v-else :src="i.icon.url" class="icon w-[18px]" :alt="i.title + ' Icon'" />
            <div class="ml-3">{{ i.title }}</div>
          </a>
        </div>

      </DialogContent>
    </DialogPortal>

  </DialogRoot>
</template>

<style>
@keyframes reka-fade-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes reka-fade-out { from { opacity: 1 } to { opacity: 0 } }
.reka-fade[data-state="open"] { animation: reka-fade-in .3s ease }
.reka-fade[data-state="closed"] { animation: reka-fade-out .3s ease }

@keyframes drawer-in { from { transform: translateX(0) } to { transform: translateX(-100%) } }
@keyframes drawer-out { from { transform: translateX(-100%) } to { transform: translateX(0) } }
.drawer[data-state="open"] { animation: drawer-in .3s ease forwards }
.drawer[data-state="closed"] { animation: drawer-out .3s ease forwards }
</style>
