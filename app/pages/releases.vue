<script setup>
// import { type ReleaseResponce } from '../../types/types';

// const { data: releases } = await useFetch<ReleaseResponce>('https://sentimony-db.firebaseio.com/releases.json');
// const { data: releases } = await useFetch('/api/releases');

const PageTitle = 'Releases';

const { data: releases } = await useFetch('https://sentimony-db.firebaseio.com/releases.json');

// const { data, error } = await useAsyncData("releases", () =>
//   $fetch("https://sentimony-db.firebaseio.com/releases.json")
// );

useSeoMeta({
  title: PageTitle,
  description: PageTitle + ' of Sentimony Records',
  ogImage: '',
});
</script>

<template>
  <div class="text-center">
    <h1 class="text-lg mb-10">
      <!-- <Icon name="mdi:music" width="24" height="24" /> -->
      {{ PageTitle }}
    </h1>
    
    <span
      v-for="([key, release]) in Object.entries(releases)"
      :key="key"
    >
      <NuxtLink 
        :to="'/release/' + key" 
        class="mr-4"
        v-if="release.visible"
      >
        <!-- <NuxtImg
          v-if="i.cover_th"
          :src="i.cover_th"
          class="inline text-xs w-5 mr-1"
          sizes="xs:20px"
          densities="x2"
          format="webp"
          :alt="i.title"
        /> -->
        <img
          v-if="release.cover_th"
          :src="release.cover_th"
          class="inline text-xs w-[20px] mr-[6px]"
          :alt="release.title"
        />
        <span class="text-xs">{{ release.title }}</span>
        <!-- <span class="text-xs">{{ key }}</span> -->
      </NuxtLink>
    </span>

  </div>
</template>

<style lang="scss"></style>
