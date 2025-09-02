<script setup>
const { id } = useRoute().params;
const { data: item } = await useFetch(`https://sentimony-db.firebaseio.com/videos/${id}.json`);

useSeoMeta({
  title: item.value.title,
  description: item.value.title + ' description',
  ogImage: item.value.cover_og,
});
</script>

<template>
  <div class="text-left">
    <div class="container border-t border-white/30">
      <div class="mb-10">
        <!-- <NuxtImg
          v-if="item.cover_th"
          :src="item.cover_th"
          class="inline text-xs w-[120px] mr-1"
          sizes="xs:120px"
          densities="x2"
          format="webp"
          :alt="item.title"
        /> -->
        <img
          v-if="item.cover_th"
          :src="item.cover_th"
          class="inline text-xs w-[120px] mr-1"
          :alt="item.title"
        />
        <h1 class="mb-4"><span class="">{{ item.title }}</span></h1>
      </div>
    </div>

    <img src="/images/triangle.svg" alt="triangle bg" />

  </div>
</template>

<style lang="scss"></style>
