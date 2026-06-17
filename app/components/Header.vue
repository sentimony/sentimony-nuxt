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

const user = useSupabaseUser()
const userInitial = computed(() => user.value?.email?.[0] ?? '')
</script>

<template>
  <div data-testid="site-header" class="sticky top-0 left-0 w-full z-20 border-b border-black/20 dark:border-white/20 bg-white/5 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
    <div class="px-0">
      <div class="container max-w-7xl">
        <div class="relative flex justify-between items-center h-[75px] px-2">

          <NuxtLink
            to="/"
            class="w-[230px] transition-[background-color] ease-in-out duration-300 hover:bg-white/30 h-[56px] flex items-center justify-center rounded-md"
            :class="route.path === '/' ? 'bg-white/20' : ''"
            v-wave
          >
            <img
              src="https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.3.svg?01"
              alt="Sentimony Records Logo SVG"
              class="mr-3 invert dark:invert-0"
              width="40" height="40"
            />
            <div class="text-left leading-[1.5] pr-1">
              <div class="text-[16px]">Sentimony Records</div>
              <div class="opacity-[0.4] text-[12px] tracking-[0.4px]">Psychedelic Music Label</div>
            </div>
          </NuxtLink>

          <div class="hidden lg:flex gap-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <NuxtLink
              v-for="i in getHeaderNav()"
              :key="i.route"
              :to="i.route"
              class="transition-[background-color] ease-in-out duration-300 text-sm hover:bg-white/30 px-4 h-9 inline-flex items-center justify-center gap-2 rounded-md"
              :class="isNavActive(i.route) ? 'bg-white/20' : ''"
              v-wave
            >
              <Icon :name="i.icon" size="18" />
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

          <NuxtLink
            v-if="user"
            to="/profile"
            class="transition-[background-color] ease-in-out duration-300 flex items-center justify-center hover:bg-white/30 size-9 rounded-md"
            :class="isNavActive('/profile') ? 'bg-white/20' : ''"
            v-wave
          >
            <span
              class="flex items-center justify-center size-7 rounded-full bg-white/20 text-sm uppercase leading-none"
            >{{ userInitial }}</span>
          </NuxtLink>
          <NuxtLink
            v-else
            to="/signin"
            class="transition-[background-color] ease-in-out duration-300 inline-flex items-center justify-center gap-2 hover:bg-white/30 px-4 h-9 rounded-md text-sm"
            :class="isNavActive('/signin') ? 'bg-white/20' : ''"
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
  </div>
</template>
