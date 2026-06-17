<script setup lang="ts">
import { computed } from 'vue'
const route = useRoute()
import { getNav, isNavActive as _navActive } from '~/constants/nav'
import { getSocials } from '~/constants/soclinks'
import { getIcon } from '~/constants/icons'
const isNavActive = (link: string) => _navActive(route.path, link)

const soc = computed(() => getSocials().map(l => ({ ...l, icon: getIcon(l.id) })))
</script>

<template>
  <div class="relative z-100 bg-black/90 dark:bg-black/75 text-white/50 leading-[1.4] md:leading-[1.5] px-1 py-24">
    <div class="container flex flex-col items-center">

      <div class="mb-10 text-sm">
        <div class="flex justify-center flex-wrap overflow-hidden rounded-sm border border-white/10 ">
          <NuxtLink
            v-for="i in getNav()"
            :key="i.route"
            :to="i.route"
            class="transition-colors ease-in-out duration-300 text-white/80 hover:text-white/100 hover:bg-white/20 p-[0.6em]"
            :class="isNavActive(i.route) ? 'bg-white/10' : ''"
            v-wave
          >
            {{ i.title }}
          </NuxtLink>
        </div>
      </div>

      <div class="mb-10 text-sm">
        <div class="">Follow Us:</div>
        <div class="pt-2 flex flex-wrap justify-center">
          <TooltipProvider v-for="i in soc" :key="i.id" :delay-duration="0">
            <Tooltip>
              <TooltipTrigger as-child>
                <a
                  :href="i.url"
                  class="transition-[opacity,background-color] ease-in-out duration-300 p-2 size-[40px] flex items-center justify-center text-white opacity-70 hover:opacity-100 hover:bg-white/10 rounded-md"
                  target="_blank" rel="noopener"
                  v-wave
                >
                  <Icon v-if="i.icon.kind === 'iconify'" :name="i.icon.name" size="22" />
                  <img v-else :src="i.icon.url" width="22" height="22" :alt="i.title + ' Icon'" />
                </a>
              </TooltipTrigger>
              <TooltipContent class="flex items-center gap-1.5 bg-emerald-900 text-white" arrow-class="bg-emerald-900 fill-emerald-900">
                {{ i.title }}
                <Icon name="lucide:arrow-up-right" size="11" class="opacity-70" />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div class="mb-24 text-sm">
        <p>2006 - {{ new Date().getFullYear() }} © Sentimony Records</p>
        <p>All Rights Reserved</p>
        <p>
          <img
            class="mx-auto"
            src="https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.2.svg?01"
            alt="Sentimony Records Logo SVG"
            width="32" height="32"
          />
        </p>
      </div>

      <div class="text-xs">
        <p>
          <span>Web Design By </span>
          <NuxtLink
            class="text-white"
            to="/artist/apivniuk"
            v-wave
          >Anton Pivniuk</NuxtLink>
        </p>
        <p>
          <span>Web Development By </span>
          <a
            class="text-white"
            href="https://github.com/sentimony/sentimony-nuxt"
            target="_blank" rel="noopener"
            v-wave
          >Ihor Orlovskyi</a>
        </p>
      </div>

    </div>
  </div>
</template>
