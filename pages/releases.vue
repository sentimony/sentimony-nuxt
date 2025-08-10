<template>
  <div class="px-1 pb-[30px] md:pb-[60px]">

    <h1>{{ pageTitle }}</h1>

    <div class="flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]">

      <div
        class="w-[76px] md:w-[180px]"
        v-for="(i, index) in releasesSortedByDate"
        :key="index"
        v-if="i.visible"
      >
        <router-link
          v-ripple
          class="block group"
          v-if="i.slug"
          :to="'/release/' + i.slug + '/'"
        >
          
          <div class="relative mb-[4px] flex items-center justify-center w-[70px] md:w-[140px] h-[70px] md:h-[140px] mx-auto rounded-[2px] transition-[background-color] duration-200 ease-in-out group-hover:bg-white/30">
            <div class="w-[60px] md:w-[120px] h-[60px] md:h-[120px] shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] text-left rounded-[2px] bg-black/50">
              <img
                class="block rounded-[2px]"
                v-if="i.cover_th"
                :src="i.cover_th"
                :alt="i.title + ' Small Thumbnail'"
              />
              <div v-else class="text-[7px]/[1.25] md:text-[10px]/[1.5] py-[0.3em] px-[0.5em] md:py-[0.6em] md:px-[1em] text-white/50" v-html="texts.comingCover"/>
            </div>
            <div v-if="i.coming_soon" class="text-[7px] md:text-[10px] absolute top-[-5px] md:top-[0] right-[-5px] md:right-[0] bg-green-600 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] px-[.8em] py-[.2em]">Coming Soon</div>
            <div v-if="i.new" class="text-[7px] md:text-[10px] absolute top-[-5px] md:top-[0] right-[-5px] md:right-[0] bg-red-600 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] px-[.8em] py-[.2em]">Out Now</div>
          </div>

          <div class="text-[8px] md:text-[12px] mb-[.5rem] px-[2px]">{{ i.title }}</div>

        </router-link>
      </div>

    </div>

  </div>
</template>

<script>
  import axios from '~/plugins/axios'
  import sortBy from 'lodash/sortBy'
  import AppContent from '~/plugins/app-content'

  export default {
    layout: 'default',
    data() {
      return {
        pageTitle: 'Releases',
        texts: AppContent.texts,
      }
    },
    async asyncData() {
      const { data } = await axios.get('releases.json')
      return { releases: data }
    },
    computed: {
      releasesSortedByDate() {
        return sortBy(this.releases, 'date').reverse()
      }
    },
    head: {
      title: 'Releases',
      meta: [
        { name: 'description', content: 'Releases of Sentimony Records' },
        { property: 'og:image', content: 'https://content.sentimony.com/assets/img/og-images/sentimony/og-releases.jpg?01' }
      ]
    }
  }
</script>

<style lang="scss"></style>
