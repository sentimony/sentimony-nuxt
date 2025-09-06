<script setup lang="ts">
// import { toArray } from '~/composables/toArray'

// const { data: playlistsRaw } = await usePlaylists()
// const playlists = computed(() => toArray(playlistsRaw.value, 'playlists'))
// const playlistsSortedByDate = computed(() =>
//   [...playlists.value]
//     .filter((r: any) => Boolean(r?.visible))
//     .sort((a: any, b: any) =>
//       new Date(b?.date ?? 0).getTime() - new Date(a?.date ?? 0).getTime()
//     )
// )
const PageTitle = 'Playlists';
useSeoMeta({
  title: PageTitle,
  description: PageTitle + ' of Sentimony Records',
  ogImage: '',
});
</script>

<template>
  <div class="px-1 pb-[30px] md:pb-[60px]">

    <!-- <h1 class="mb-4">{{ PageTitle }}</h1>

    <div class="flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]">
      <Item 
        v-for="i in playlistsSortedByDate"
        :key="i.slug"
        category="playlist"
        :i="i"
      />
    </div> -->

  </div>
</template>

<style lang="scss"></style>
