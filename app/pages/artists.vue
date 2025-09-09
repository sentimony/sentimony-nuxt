<script setup lang="ts">
import { toArray } from '~/composables/toArray'

const { data: artistsRaw } = await useArtists()
const artists = computed(() => toArray(artistsRaw.value, 'artists'))
const artistsSortedByCategoryIdMusician = computed(() =>
  [...artists.value]
    .filter((r: any) => Boolean(r?.visible) && r?.category === 'musician')
    .sort((a: any, b: any) =>
      (a?.category_id ?? 0) - (b?.category_id ?? 0)
    )
)
const artistsSortedByCategoryIdDj = computed(() =>
  [...artists.value]
    .filter((r: any) => Boolean(r?.visible) && r?.category === 'dj')
    .sort((a: any, b: any) =>
      (a?.category_id ?? 0) - (b?.category_id ?? 0)
    )
)
const artistsSortedByCategoryIdMastering = computed(() =>
  [...artists.value]
    .filter((r: any) => Boolean(r?.visible) && r?.category === 'mastering')
    .sort((a: any, b: any) =>
      (a?.category_id ?? 0) - (b?.category_id ?? 0)
    )
)
const artistsSortedByCategoryIdDesigner = computed(() =>
  [...artists.value]
    .filter((r: any) => Boolean(r?.visible) && r?.category === 'designer')
    .sort((a: any, b: any) =>
      (a?.category_id ?? 0) - (b?.category_id ?? 0)
    )
)
const PageTitle = 'Artists';
useSeoMeta({
  title: PageTitle,
  description: PageTitle + ' of Sentimony Records',
  ogImage: '',
});
</script>

<template>
  <div class="px-1 pb-[30px] md:pb-[60px]">

    <h1 class="mb-4">{{ PageTitle }}</h1>

    <!-- <h2 class="">Producers & Musicians</h2> -->
    <div class="flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]">
      <Item
        v-for="i in artistsSortedByCategoryIdMusician"
        :key="i.slug"
        category="artist"
        :i="i"
      />
    </div>

    <h2 class="">Djs</h2>
    <div class="flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]">
      <Item
        v-for="i in artistsSortedByCategoryIdDj"
        :key="i.slug"
        category="artist"
        :i="i"
      />
    </div>

    <h2 class="">Sound Engineers & Mastering Services</h2>
    <div class="flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]">
      <Item
        v-for="i in artistsSortedByCategoryIdMastering"
        :key="i.slug"
        category="artist"
        :i="i"
      />
    </div>

    <h2 class="">Visual Artists & Designers</h2>
    <div class="flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]">
      <Item
        v-for="i in artistsSortedByCategoryIdDesigner"
        :key="i.slug"
        category="artist"
        :i="i"
      />
    </div>

  </div>
</template>

<style lang="scss"></style>
