<script setup>
const { id } = useRoute().params;
const { data: item } = await useFetch(`https://sentimony-db.firebaseio.com/artists/${id}.json`);

useSeoMeta({
  title: item.value.title,
  description: item.value.title + ' description',
  ogImage: item.value.cover_og,
});
</script>

<template>
  <div class="text-center">
    <h1 class="text-lg mb-10">
      <!-- <Icon name="mdi:music" width="24" height="24" /> -->
      <span class="">{{ item.title }}</span>
    </h1>
    <div>
      <!-- <NuxtImg
        v-if="item.photo_th"
        :src="item.photo_th"
        class="inline text-xs w-[120px] mr-1"
        sizes="xs:120px"
        densities="x2"
        format="webp"
        :alt="item.title"
      /> -->
      <img
        v-if="item.photo_th"
        :src="item.photo_th"
        class="inline text-xs w-[120px] mr-1"
        :alt="item.title"
      />
    </div>
  </div>
</template>

<style lang="scss"></style>
