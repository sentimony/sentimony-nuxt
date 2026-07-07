<script setup lang="ts">
import { computed } from 'vue'
const route = useRoute()
import { getHeaderNav, isNavActive as _navActive } from '~/constants/nav'
import { getSocials } from '~/constants/soclinks'
import { getIcon } from '~/constants/icons'
const isNavActive = (link: string) => _navActive(route.path, link)

const soc = computed(() =>
  getSocials({ inHeader: true }).map(l => ({ ...l, icon: getIcon(l.id) }))
)

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const username = computed(() => user.value?.user_metadata?.full_name || '')
const userInitials = computed(() => {
  const name = user.value?.user_metadata?.full_name || ''
  if (!name) return (user.value?.email?.[0] || '?').toUpperCase()
  return name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
})
const avatarUrl = computed(() => {
  const meta = user.value?.user_metadata as Record<string, unknown> | undefined
  return (meta?.avatar_url as string) || ''
})
const avatarFailed = ref(false)
watch(avatarUrl, () => { avatarFailed.value = false })

async function signOut() {
  await supabase.auth.signOut()
  await navigateTo('/signin')
}
</script>

<template>
  <div data-testid="site-header" class="sticky top-0 left-0 w-full z-20 border-b border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
    <div class="px-0">
      <div class="container max-w-7xl">
        <div class="relative flex justify-between items-center h-18.75 px-2">

          <NuxtLink
            to="/"
            class="w-57.5 transition-[background-color] ease-in-out duration-300 hover:bg-white/30 h-14 flex items-center justify-center rounded-md"
            :class="route.path === '/' ? 'bg-white/20' : ''"
            v-wave
          >
            <img
              src="https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.3.svg?01"
              alt="Sentimony Records Logo SVG"
              class="mr-3 invert dark:invert-0"
              width="40" height="40"
            />
            <div class="text-left leading-normal pr-1">
              <div class="text-[16px]">Sentimony Records</div>
              <div class="opacity-[0.4] text-[12px] tracking-[0.4px]">Psychedelic Music Label</div>
            </div>
          </NuxtLink>

          <div class="hidden lg:flex gap-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <NuxtLink
              v-for="i in getHeaderNav()"
              :key="i.route"
              :to="i.route"
              class="transition-[background-color] ease-in-out duration-300 text-sm uppercase tracking-wider hover:bg-white/30 px-4 h-9 inline-flex items-center justify-center gap-2 rounded-md"
              :class="isNavActive(i.route) ? 'bg-white/20' : ''"
              v-wave
            >
              <Icon :name="i.icon" size="16" />
              <span>{{ i.title }}</span>
            </NuxtLink>
          </div>

          <div class="flex items-center gap-2">

          <div class="hidden xl:flex gap-2">
            <TooltipProvider v-for="i in soc" :key="i.id" :delay-duration="0">
              <Tooltip>
                <TooltipTrigger as-child>
                  <a
                    :href="i.url"
                    class="flex items-center justify-center transition-[background-color] ease-in-out duration-300 hover:bg-white/30 size-9 rounded-md"
                    target="_blank" rel="noopener"
                    v-wave
                  >
                    <Icon v-if="i.icon.kind === 'iconify'" :name="i.icon.name" size="18" />
                    <img v-else :src="i.icon.url" :alt="i.title + ' Icon'" width="18" height="18">
                  </a>
                </TooltipTrigger>
                <TooltipContent class="flex items-center gap-1.5">
                  {{ i.title }}
                  <Icon name="lucide:arrow-up-right" size="11" class="opacity-60" />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <ThemeToggle />

          <DropdownMenuRoot v-if="user">
            <DropdownMenuTrigger as-child>
              <button
                type="button"
                :aria-label="`User menu: ${username || user.email || 'account'}`"
                class="transition-[background-color] ease-in-out duration-300 flex items-center gap-1 hover:bg-white/30 px-1.5 h-9 rounded-md cursor-pointer"
                :class="isNavActive('/profile') ? 'bg-white/20' : ''"
                v-wave
              >
                <span class="flex items-center justify-center size-7 rounded-full bg-white/20 text-xs uppercase leading-none overflow-hidden">
                  <img v-if="avatarUrl && !avatarFailed" :src="avatarUrl" alt="Avatar" class="size-full object-cover" referrerpolicy="no-referrer" @error="avatarFailed = true" />
                  <span v-else>{{ userInitials }}</span>
                </span>
                <Icon name="lucide:chevron-down" size="13" class="opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent
                side="bottom"
                align="end"
                :side-offset="8"
                class="z-50 min-w-52 rounded-lg shadow-xl overflow-hidden border border-black/20 dark:border-white/20 bg-white/80 dark:bg-black/80 backdrop-blur-sm"
              >
                <div class="px-3 py-2.5 border-b border-black/10 dark:border-white/10">
                  <div v-if="username" class="text-sm font-medium truncate">{{ username }}</div>
                  <div class="text-xs truncate opacity-50">{{ user.email }}</div>
                </div>
                <DropdownMenuItem as-child>
                  <NuxtLink
                    to="/profile"
                    class="flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-black/10 dark:hover:bg-white/10 outline-none data-[highlighted]:bg-black/10 dark:data-[highlighted]:bg-white/10"
                  >
                    <Icon name="lucide:circle-user-round" size="18" class="opacity-50" />
                    <span>Profile</span>
                  </NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <button
                    type="button"
                    class="w-full text-left flex items-center gap-3 px-3 py-2 text-sm transition-colors border-t border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 outline-none data-[highlighted]:bg-black/10 dark:data-[highlighted]:bg-white/10 cursor-pointer"
                    @click="signOut"
                  >
                    <Icon name="lucide:log-out" size="18" class="opacity-50" />
                    <span>Sign Out</span>
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenuRoot>

          <NuxtLink
            v-else
            to="/signin"
            class="transition-[background-color] ease-in-out duration-300 inline-flex items-center justify-center gap-2 hover:bg-black/10 dark:hover:bg-white/30 px-4 h-9 rounded-md text-sm border border-black/20 dark:border-white/20"
            :class="isNavActive('/signin') ? 'bg-black/10 dark:bg-white/20' : ''"
            v-wave
          >
            <Icon name="lucide:log-in" size="18" />
            <span class="hidden sm:inline">Sign In</span>
          </NuxtLink>

          <div class="size-9 lg:hidden" />

          </div>

        </div>
      </div>
    </div>
    <HeaderMiniPlayer />
  </div>
</template>
