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
  <div class="sticky top-0 left-0 w-full z-10 border-b border-white/30 bg-white/5 backdrop-blur-sm">
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
              class="w-[40px] mr-3"
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

          <div class="HeaderSoc hidden md:flex justify-between">
            <a
              v-for="i in soc"
              :href="i.url"
              class="flex items-center justify-center transition-colors ease-in-out duration-300 text-white/50 hover:text-white/100 hover:bg-white/30 md:w-[46px] lg:w-[56px] h-[56px] rounded-[2px] group relative"
              target="_blank" rel="noopener"
              v-wave
            >
              <Icon v-if="i.icon.kind === 'iconify'" :name="i.icon.name" size="22" />
              <img v-else :src="i.icon.url" class="icon w-[24px]" :alt="i.title + ' Icon'" />
              <div class="HeaderSocTooltip">{{ i.title }}</div>
            </a>
          </div>

          <div class="size-[56px] md:hidden" />

          <!-- <OpenSidebar class="md:hidden" /> -->

        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.HeaderSoc {
  & .HeaderSocTooltip {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    opacity: .75;
    transition: opacity .2s ease,
                font-size .2s ease,
                letter-spacing .2s ease;

    letter-spacing: -4px;
    font-size: 8px;
    bottom: 2px;
    opacity: 0;
  }

  & a:hover {
    & .HeaderSocTooltip {
      opacity: 1;
      letter-spacing: 0px;
      font-size: 8px;
    }
  }
}
</style>
