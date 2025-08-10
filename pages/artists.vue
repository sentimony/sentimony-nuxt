<template>
  <div class="px-1 pb-[30px] md:pb-[60px]">

    <h1>{{ pageTitle }}</h1>

    <h2>Producers & Musicians</h2>

    <div class="flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]">

      <div
        class="w-[76px] md:w-[180px]"
        v-for="(i, index) in artistsSortByCategoryId"
        :key="index"
        v-if="i.visible && i.category == 'musician'"
      >
        <router-link
          v-ripple
          class="block group"
          v-if="i.slug"
          :to="'/artist/' + i.slug + '/'"
        >

          <div class="relative mb-[4px] flex items-center justify-center w-[70px] md:w-[140px] h-[70px] md:h-[140px] mx-auto rounded-[2px] transition-[background-color] duration-200 ease-in-out group-hover:bg-white/30">
            <div class="w-[60px] md:w-[120px] h-[60px] md:h-[120px] shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] text-left rounded-[2px] bg-black/50">
              <img
                class="block rounded-[2px]"
                v-if="i.photo_th"
                :src="i.photo_th"
                :alt="i.title + ' Small Thumbnail'"
              />
              <div v-else class="text-[7px]/[1.25] md:text-[10px]/[1.5] py-[0.3em] px-[0.5em] md:py-[0.6em] md:px-[1em] text-white/50" v-html="texts.comingPhoto"/>
            </div>
          </div>

          <div class="text-[8px] md:text-[12px] mb-[.5rem] px-[2px]">{{ i.title }}</div>

        </router-link>
      </div>
    
    </div>

    <h2>Djs</h2>

    <div class="flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]">

      <div
        class="w-[76px] md:w-[180px]"
        v-for="(i, index) in artistsSortByCategoryId"
        :key="index"
        v-if="i.visible && i.category == 'dj'"
      >
        <router-link
          v-ripple
          class="block group"
          v-if="i.slug"
          :to="'/artist/' + i.slug + '/'"
        >

          <div class="relative mb-[4px] flex items-center justify-center w-[70px] md:w-[140px] h-[70px] md:h-[140px] mx-auto rounded-[2px] transition-[background-color] duration-200 ease-in-out group-hover:bg-white/30">
            <div class="w-[60px] md:w-[120px] h-[60px] md:h-[120px] shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] text-left rounded-[2px] bg-black/50">
              <img
                class="block rounded-[2px]"
                v-if="i.photo_th"
                :src="i.photo_th"
                :alt="i.title + ' Small Thumbnail'"
              />
              <div v-else class="text-[7px]/[1.25] md:text-[10px]/[1.5] py-[0.3em] px-[0.5em] md:py-[0.6em] md:px-[1em] text-white/50" v-html="texts.comingPhoto"/>
            </div>
          </div>

          <div class="text-[8px] md:text-[12px] mb-[.5rem] px-[2px]">{{ i.title }}</div>

        </router-link>
      </div>
    </div>

    <h2>Sound Engineers & Mastering Services</h2>

    <div class="flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]">

      <div
        class="w-[76px] md:w-[180px]"
        v-for="(i, index) in artistsSortByCategoryId"
        :key="index"
        v-if="i.visible && i.category == 'mastering'"
      >
        <router-link
          v-ripple
          class="block group"
          v-if="i.slug"
          :to="'/artist/' + i.slug + '/'"
        >

          <div class="relative mb-[4px] flex items-center justify-center w-[70px] md:w-[140px] h-[70px] md:h-[140px] mx-auto rounded-[2px] transition-[background-color] duration-200 ease-in-out group-hover:bg-white/30">
            <div class="w-[60px] md:w-[120px] h-[60px] md:h-[120px] shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] text-left rounded-[2px] bg-black/50">
              <img
                class="block rounded-[2px]"
                v-if="i.photo_th"
                :src="i.photo_th"
                :alt="i.title + ' Small Thumbnail'"
              />
              <div v-else class="text-[7px]/[1.25] md:text-[10px]/[1.5] py-[0.3em] px-[0.5em] md:py-[0.6em] md:px-[1em] text-white/50" v-html="texts.comingPhoto"/>
            </div>
          </div>

          <div class="text-[8px] md:text-[12px] mb-[.5rem] px-[2px]">{{ i.title }}</div>

        </router-link>
      </div>
    </div>

    <h2>Visual Artists & Designers</h2>

    <div class="flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]">

      <div
        class="w-[76px] md:w-[180px]"
        v-for="(i, index) in artistsSortByCategoryId"
        :key="index"
        v-if="i.visible && i.category == 'designer'"
      >
        <router-link
          v-ripple
          class="block group"
          v-if="i.slug"
          :to="'/artist/' + i.slug + '/'"
        >

          <div class="relative mb-[4px] flex items-center justify-center w-[70px] md:w-[140px] h-[70px] md:h-[140px] mx-auto rounded-[2px] transition-[background-color] duration-200 ease-in-out group-hover:bg-white/30">
            <div class="w-[60px] md:w-[120px] h-[60px] md:h-[120px] shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] text-left rounded-[2px] bg-black/50">
              <img
                class="block rounded-[2px]"
                v-if="i.photo_th"
                :src="i.photo_th"
                :alt="i.title + ' Small Thumbnail'"
              />
              <div v-else class="text-[7px]/[1.25] md:text-[10px]/[1.5] py-[0.3em] px-[0.5em] md:py-[0.6em] md:px-[1em] text-white/50" v-html="texts.comingPhoto"/>
            </div>
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
        pageTitle: 'Artists',
        texts: AppContent.texts,
      }
    },
    async asyncData() {
      const { data } = await axios.get('artists.json')
      return { artists: data }
    },
    computed: {
      artistsSortByCategoryId() {
        return sortBy(this.artists, 'category_id')
      }
    },
    head: {
      title: 'Artists',
      meta: [
        { name: 'description', content: 'Artists of Sentimony Records' },
        { property: 'og:image', content: 'https://content.sentimony.com/assets/img/og-images/sentimony/og-default.jpg?01' }
      ]
    }
  }
</script>

<style lang="scss"></style>
