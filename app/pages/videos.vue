<script setup lang="ts">
const { data, error } = await useAsyncData("videos", () =>
  $fetch("https://sentimony-db.firebaseio.com/videos.json")
);
</script>

<template>
  <div class="text-center">
    <h1 class="text-lg mb-10">
      <Icon name="mdi:video-vintage" width="24" height="24" />
      Videos
    </h1>

    <span
      v-for="i in data"
    >
      <NuxtLink 
        :to="'video' + '/' + i.slug" 
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
