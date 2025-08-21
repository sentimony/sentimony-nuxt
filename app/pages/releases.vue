<script setup lang="ts">
// import { type ReleaseResponce } from "../../types/types";

// const { data, error } = await useFetch<ReleaseResponce>("https://sentimony-db.firebaseio.com/releases.json");

const { data, error } = await useAsyncData("releases", () =>
  $fetch("https://sentimony-db.firebaseio.com/releases.json")
);
</script>

<template>
  <div class="text-center">
    <h1 class="text-lg mb-10">
      <Icon name="mdi:music" width="24" height="24" />
      Releases
    </h1>

    <span
      v-for="i in data"
    >
      <NuxtLink 
        :to="'release' + '/' + i.slug" 
        class="mr-4"
        v-if="i.visible"
      >
        <NuxtImg
          v-if="i.cover_th"
          :src="i.cover_th"
          class="inline text-xs w-5 mr-1"
          sizes="xs:20px"
          densities="x2"
          format="webp"
          :alt="i.title"
        />
        <span class="text-xs">{{ i.title }}</span>
      </NuxtLink>
    </span>

  </div>
</template>

<style lang="scss" scoped></style>
