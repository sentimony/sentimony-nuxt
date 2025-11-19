<script setup lang="ts">
import { computed } from 'vue'
const route = useRoute()
import { getNav, isNavActive as _navActive } from '~/constants/nav'
import { getSocials } from '~/constants/soclinks'
import { getIcon } from '~/constants/icons'
const isNavActive = (link: string) => _navActive(route.path, link)

// Social links with resolved icons
const soc = computed(() => getSocials().map(l => ({ ...l, icon: getIcon(l.id) })))

// Active highlighting uses centralized helper
</script>

<template>
  <div class="relative z-100 bg-black text-white/50 leading-[1.4] md:leading-[1.5] px-1 py-24">
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
          <a
            v-for="i in soc"
            :href="i.url"
            class="group transition-all ease-in-out duration-300 p-2 relative size-[40px] flex items-center justify-center text-white opacity-70 hover:opacity-100 hover:bg-white/10 rounded-md"
            target="_blank" rel="noopener"
            v-wave
          >
            <Icon v-if="i.icon.kind === 'iconify'" :name="i.icon.name" size="22" />
            <img v-else :src="i.icon.url" width="22" height="22" :alt="i.title + ' Icon'" />
            <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[133%] transition-all duration-300 ease-in-out opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-[66%] bg-[#8a0202] px-1 rounded-sm text-white text-xs whitespace-nowrap">{{ i.title }}</div>
          </a>
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
