<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { getNav, isNavActive as _navActive } from '~/constants/nav'
import { getSocials } from '~/constants/soclinks'
import { getIcon } from '~/constants/icons'
const route = useRoute()
const isNavActive = (link: string) => _navActive(route.path, link)

const isOpen = ref(false)
const triggerRef = ref<HTMLElement | null>(null)

const soc = computed(() =>
  getSocials({ inHeader: true }).map(l => ({ ...l, icon: getIcon(l.id) }))
)

const { isDark, toggle } = useTheme()
const user = useSupabaseUser()
const userInitial = computed(() => user.value?.email?.[0]?.toUpperCase() ?? '')
const avatarUrl = computed(() => {
  const meta = user.value?.user_metadata as Record<string, unknown> | undefined
  return (meta?.avatar_url as string) || ''
})
const avatarFailed = ref(false)
watch(avatarUrl, () => { avatarFailed.value = false })

const onInteractOutside = (e: CustomEvent) => {
  const target = (e.detail.originalEvent as Event).target as Node | null
  if (target && triggerRef.value?.contains(target)) e.preventDefault()
}

watch(() => route.path, () => { isOpen.value = false })
</script>

<template>
  <DialogRoot v-model:open="isOpen" :modal="false">

    <DialogTrigger as-child>
      <button
        ref="triggerRef"
        type="button"
        :aria-label="isOpen ? 'Close menu' : 'Menu'"
        class="fixed top-0 right-0 mr-2 mt-[19px] z-50 lg:hidden flex items-center justify-center transition-[background-color,border-color,rotate] ease-in-out duration-300 cursor-pointer rounded-md border hover:bg-white/30 hover:border-black/50 dark:hover:border-white/30 size-9"
        :class="isOpen ? 'bg-white/20 border-black/30 dark:border-white/20 rotate-[360deg]' : 'border-transparent'"
        v-wave
      >
        <Icon v-if="isOpen" name="lucide:x" size="18" />
        <Icon v-else name="lucide:menu" size="18" />
      </button>
    </DialogTrigger>

    <div
      class="fixed left-full w-screen h-screen top-0 z-30 lg:hidden bg-white/30 dark:bg-black/30 backdrop-blur-sm transition-transform duration-300 ease-in-out"
      :class="isOpen ? '-translate-x-full pointer-events-auto' : 'pointer-events-none'"
      @click="isOpen = false"
    />

    <DialogPortal>
      <DialogContent
        class="drawer fixed left-full w-[256px] h-screen top-0 z-40 lg:hidden flex flex-col bg-white/60 dark:bg-black/60 backdrop-blur-sm pt-2 focus:outline-none"
        @interact-outside="onInteractOutside"
      >
        <VisuallyHidden>
          <DialogTitle>Menu</DialogTitle>
          <DialogDescription>Site navigation and social links</DialogDescription>
        </VisuallyHidden>

        <div class="flex flex-col items-center gap-1 px-2 py-2">
          <NuxtLink
            v-for="i in getNav()"
            :key="i.route"
            :to="i.route"
            class="flex items-center justify-center gap-2 h-9 px-4 rounded-md border text-sm transition-[background-color,border-color] duration-300 ease-in-out hover:bg-white/30 hover:border-black/50 dark:hover:border-white/30"
            :class="isNavActive(i.route) ? 'bg-white/20 border-black/30 dark:border-white/20' : 'border-transparent'"
            v-wave
          >
            <Icon :name="i.icon" size="18" />
            <span>{{ i.title }}</span>
          </NuxtLink>
        </div>

        <hr class="border-black/30 dark:border-white/30" />

        <div class="flex flex-col items-center gap-1 px-2 py-2">
          <button
            type="button"
            :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
            class="flex items-center justify-center gap-2 h-9 px-4 rounded-md border border-transparent hover:bg-white/30 hover:border-black/50 dark:hover:border-white/30 text-sm transition-[background-color,border-color] duration-300 ease-in-out cursor-pointer"
            @click="toggle($event)"
            v-wave
          >
            <Icon v-if="isDark" name="lucide:sun" size="18" />
            <Icon v-else name="lucide:moon" size="18" />
            <span>{{ isDark ? 'Light' : 'Dark' }}</span>
          </button>

          <NuxtLink
            v-if="user"
            to="/profile"
            class="flex items-center justify-center gap-2 h-9 px-4 rounded-md border hover:bg-white/30 hover:border-black/50 dark:hover:border-white/30 text-sm transition-[background-color,border-color] duration-300 ease-in-out cursor-pointer"
            :class="isNavActive('/profile') ? 'bg-white/20 border-black/30 dark:border-white/20' : 'border-transparent'"
            @click="isOpen = false"
            v-wave
          >
            <span class="flex items-center justify-center size-6 rounded-full bg-black/20 dark:bg-white/20 text-xs uppercase leading-none overflow-hidden">
                <img v-if="avatarUrl && !avatarFailed" :src="avatarUrl" alt="Avatar" class="size-full object-cover" referrerpolicy="no-referrer" @error="avatarFailed = true" />
                <span v-else>{{ userInitial }}</span>
              </span>
            <span>Profile</span>
          </NuxtLink>
          <NuxtLink
            v-else
            to="/signin"
            class="flex items-center justify-center gap-2 h-9 px-4 rounded-md border hover:bg-white/30 hover:border-black/50 dark:hover:border-white/30 text-sm transition-[background-color,border-color] duration-300 ease-in-out cursor-pointer"
            :class="isNavActive('/signin') ? 'bg-white/20 border-black/30 dark:border-white/20' : 'border-transparent'"
            @click="isOpen = false"
            v-wave
          >
            <Icon name="lucide:log-in" size="18" />
            <span>Sign In</span>
          </NuxtLink>
        </div>

        <hr class="border-black/30 dark:border-white/30" />

        <div class="flex flex-col items-center gap-1 px-2 py-2">
          <a
            v-for="i in soc"
            :href="i.url"
            class="flex flex-row items-center h-9 px-4 justify-center rounded-md border border-transparent hover:bg-white/30 hover:border-black/50 dark:hover:border-white/30 transition-[background-color,border-color] duration-300 ease-in-out text-sm"
            target="_blank" rel="noopener"
            v-wave
          >
            <Icon v-if="i.icon.kind === 'iconify'" :name="i.icon.name" size="18" />
            <img v-else :src="i.icon.url" class="icon w-[18px] dark:invert" :alt="i.title + ' Icon'" />
            <div class="ml-3">{{ i.title }}</div>
            <Icon name="lucide:arrow-up-right" size="12" class="ml-1 opacity-50" />
          </a>
        </div>

      </DialogContent>
    </DialogPortal>

  </DialogRoot>
</template>

<style>
@keyframes sweep-in { from { transform: translateX(0) } to { transform: translateX(-100%) } }
@keyframes sweep-out { from { transform: translateX(-100%) } to { transform: translateX(0) } }
.drawer[data-state="open"] { animation: sweep-in .3s ease forwards }
.drawer[data-state="closed"] { animation: sweep-out .3s ease forwards }
</style>
