<script setup lang="ts">
import { computed } from 'vue'
const route = useRoute()
import { getHeaderNav, isNavActive as _navActive } from '~/constants/nav'
import { getSocials } from '~/constants/soclinks'
import { getIcon } from '~/constants/icons'
const isNavActive = (link: string) => _navActive(route.path, link)

// Header socials from constants with inHeader flag and resolved icons
const soc = computed(() =>
  getSocials({ inHeader: true }).map(l => ({ ...l, icon: getIcon(l.id) }))
)

// Active highlighting uses centralized helper
</script>

<template>
  <div class="sticky top-0 left-0 w-full z-20 border-b border-white/30 bg-white/5 backdrop-blur-sm overflow-hidden">
    <div class="px-0">
      <div class="container max-w-7xl">
        <div class="flex justify-between items-center h-[75px] px-2">

          <NuxtLink
            to="/"
            class="w-[230px] transition-[background-color] ease-in-out duration-300 hover:bg-white/30 h-[56px] flex items-center justify-center rounded-[2px]"
            active-class="bg-white/20"
            v-wave
          >
            <img
              src="https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.3.svg?01"
              alt="Sentimony Records Logo SVG"
              class="mr-3"
              width="40" height="40"
            />
            <div class="text-left leading-[1.5] pr-1">
              <div class="text-[16px]">Sentimony Records</div>
              <div class="opacity-[0.4] text-[12px] tracking-[0.4px]">Psychedelic Music Label</div>
            </div>
          </NuxtLink>

          <div class="hidden sm:flex">
            <NuxtLink
              v-for="i in getHeaderNav()"
              :key="i.route"
              :to="i.route"
              class="transition-[background-color] ease-in-out duration-300 text-[16px] hover:bg-white/30 sm:px-2 md:px-3 lg:px-4 h-[56px] flex items-center justify-center rounded-[2px]"
              :class="isNavActive(i.route) ? 'bg-white/20' : ''"
              v-wave
            >
              <span>{{ i.title }}</span>
            </NuxtLink>
          </div>

          <div class="hidden md:flex justify-between">
            <div
              v-for="i in soc"
              class="relative z-30 group"
            >
              <a
                :href="i.url"
                class="flex items-center justify-center transition-colors ease-in-out duration-300 text-white/50 hover:text-white/100 hover:bg-white/30 md:w-[46px] lg:w-[56px] h-[56px] rounded-[2px] relative z-30"
                target="_blank" rel="noopener"
                v-wave
              >
                <Icon v-if="i.icon.kind === 'iconify'" class="" :name="i.icon.name" size="22" />
                <img v-else :src="i.icon.url" class="" :alt="i.title + ' Icon'" width="22" height="22">
              </a>
              <div class="absolute  tracking-[0.5em] left-1/2 top-full -translate-x-1/2 -translate-y-3/4 opacity-0 text-[8px]/[2em] group-hover:tracking-normal group-hover:opacity-100  group-hover:-translate-y-full transition-all ease-in-out duration-300 z-10">{{ i.title }}</div>
            </div>
          </div>

          <div class="size-[56px] md:hidden md:size-0" />

          <!-- <OpenSidebar class="md:hidden" /> -->

        </div>
      </div>
    </div>
  </div>
</template>
