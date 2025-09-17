<script setup lang="ts">
import { ref, watch } from 'vue'
import { getNav, isNavActive as _navActive } from '~/constants/nav'
import { getSocials } from '~/constants/soclinks'
import { getIcon } from '~/constants/icons'
const route = useRoute()
const isNavActive = (link: string) => _navActive(route.path, link)

const isOpen = ref(false)
const toggleSidebar = () => { isOpen.value = !isOpen.value }
// const closeSidebar = () => { isOpen.value = false }

const soc = computed(() =>
  getSocials({ inHeader: true }).map(l => ({ ...l, icon: getIcon(l.id) }))
)

// Close sidebar on route change
watch(() => route.path, () => { isOpen.value = false })


// Active highlighting uses centralized helper
</script>

<template>
  <div>

    <div
      class="fixed left-full top-0 w-screen h-screen z-30 bg-black/30 backdrop-blur-sm"
      :class="isOpen ? '-translate-x-full' : ''"
      @click="toggleSidebar"
    />

    <div
      class="fixed top-0 right-0 mr-2 mt-[9px] z-50 flex items-center justify-center transition ease-in-out duration-300 cursor-pointer rounded-[2px] hover:bg-white/30 size-[56px]"
      :class="isOpen ? 'bg-white/20 rotate-[360deg]' : ''"
      @click="toggleSidebar"
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
    </div>

    <div
      class="fixed left-full w-[256px] h-screen top-0 z-40 transition-transform duration-300 ease-in-out flex flex-col bg-black/60 pt-2"
      :class="isOpen ? '-translate-x-full' : ''"
      @click="toggleSidebar"
    >
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

      <!-- <HeaderSocialMenu style="display: flex; justify-content: center;" /> -->

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

    </div>

  </div>
</template>

<style lang="scss"></style>
