<script setup lang="ts">
const { id } = useRoute().params;

const { data, error } = await useAsyncData("video", () =>
  $fetch(`https://sentimony-db.firebaseio.com/videos/${id}.json`)
);
</script>

<template>
  <div class="text-center">
    <h1 class="text-lg mb-10">
      <!-- <Icon name="mdi:music" width="24" height="24" /> -->
      <span class="">{{ data.title }}</span>
    </h1>
    <div>
      <NuxtImg
        v-if="data.cover_th"
        :src="data.cover_th"
        class="inline text-xs w-[120px] mr-1"
        sizes="xs:120px"
        densities="x2"
        format="webp"
        :alt="data.title"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
