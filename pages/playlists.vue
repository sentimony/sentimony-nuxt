<template>
  <div class="px-1 pb-[30px] md:pb-[60px]">

    <h1>{{ pageTitle }}</h1>

    <div class="flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]">

      <div 
        class="w-[76px] md:w-[180px]"
        v-for="(i, index) in playlistsSortedByDate"
        :key="index"
        v-if="i.visible"
      >
        <router-link 
          v-ripple 
          class="block group"
          v-if="i.slug" 
          :to="'/playlist/' + i.slug + '/'" 
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
        pageTitle: 'Playlists',
        texts: AppContent.texts,
      }
    },
    async asyncData() {
      const { data } = await axios.get('playlists.json')
      return { playlists: data }
    },
    computed: {
      playlistsSortedByDate() {
        return sortBy(this.playlists, 'date').reverse().reverse()
      }
    },
    head: {
      title: 'Playlists',
      meta: [
        { name: 'description', content: 'Playlists of Sentimony Records' },
        { property: 'og:image', content: 'https://firebasestorage.googleapis.com/v0/b/sentimony-db.appspot.com/o/og%2Fog-default.jpg?alt=media&token=85a8d7a3-ab49-4cff-9df9-fd3e2478e780' }
      ]
    }
  }
</script>

<style lang="scss"></style>
