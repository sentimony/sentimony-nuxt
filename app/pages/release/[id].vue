<script setup>
const { id } = useRoute().params;
const { data: item } = await useFetch(`https://sentimony-db.firebaseio.com/releases/${id}.json`);

useSeoMeta({
  title: item.value.title,
  description: item.value.title + ' description',
  ogImage: item.value.cover_og,
});
</script>

<template>
  <div class="">
    <h1 class="text-lg mb-1">{{ item.title }}</h1>
    <div class="text-sm mb-3">{{ item.cat_no }}</div>
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
    </div>

    <div class="bg-green-100 text-black">
      <div class="container text-left">

        <div v-if="item.tracklistCompact">
          <hr />
          <p><small><b>Tracklist:</b></small></p>
          <p
            v-for="(i, index) in item.tracklistCompact"
            :key="index"
            v-html="i.p"
          ></p>
        </div>

      </div>
    </div>

  </div>
</template>

<style lang="scss"></style>
