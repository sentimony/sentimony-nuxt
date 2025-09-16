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
  <div class="relative z-100 bg-black text-white/50 text-xs leading-[1.4] md:leading-[1.5] px-1 py-[100px]">
    <div class="container flex flex-col items-center">

      <div class="text-[14px] mb-[2em]">
        <div class="FooterNav__list flex justify-center flex-wrap">
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

      <div class="text-[14px] mb-[24px]">
        <div class="">Follow Us:</div>
        <div class="pt-2 flex flex-wrap justify-center">
          <a
            v-for="i in soc"
            :href="i.url"
            class="transition-all ease-in-out duration-300 p-2 relative size-[40px] flex items-center justify-center text-white opacity-70 hover:opacity-100 hover:bg-white/10 rounded-md"
            target="_blank" rel="noopener"
            v-wave
          >
            <Icon v-if="i.icon.kind === 'iconify'" :name="i.icon.name" size="22" />
            <img v-else :src="i.icon.url" class="w-[22px]" :alt="i.title + ' Icon'" />
            <div class="FooterSoc__tooltip whitespace-nowrap">{{ i.title }}</div>
          </a>
        </div>
      </div>

      <div class="text-[14px] mb-[24px]">
        <div>2006 - {{ new Date().getFullYear() }} © Sentimony Records</div>
        <div>All Rights Reserved</div>
        <div>
          <img
            class="w-[30px] block mx-auto mt-[4px]"
            src="https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.2.svg?01"
            alt="Sentimony Records Logo SVG"
          />
        </div>
      </div>

      <div class="text-[12px] mb-[20px]">
        <div>
          <span>Design By </span>
          <NuxtLink
            class="text-white"
            to="/artist/apivniuk"
            v-wave
          >Anton Pivniuk</NuxtLink>
        </div>
        <div>
          <span>Development By </span>
          <a
            class="text-white"
            href="https://github.com/sentimony/sentimony-nuxt"
            target="_blank" rel="noopener"
            v-wave
          >Ihor Orlovskyi</a>
        </div>
      </div>

    </div>
  </div>
</template>

<style lang="scss">
.FooterNav {
  &__list {
    border: 1px solid rgba(#fff, 0.1);
    border-width: 1px;
    border-radius: 4px;
    overflow: hidden;
  }
}

.FooterSoc {
  &__tooltip {
    font-size: 10px;
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translate3d(-50%,0,0);
    transition: all .3s ease-in-out;
    opacity: 0;
    visibility: hidden;
    background-color: rgba(#8a0202, 1);
    padding: 1px 4px;
    border-radius: 4px;
    color: #fff;

    a:hover & {
      opacity: 1;
      visibility: visible;
      transform: translate3d(-50%,50%,0);
    }
  }
}
</style>
