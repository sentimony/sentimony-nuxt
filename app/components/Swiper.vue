<script setup lang="ts">
defineProps<{
  title?: string;
  route?: string;
  list?: any[];
}>()
</script>

<template>
  <div class="mb-10">
    <div v-if="title" class="text-lg my-10">{{ title }}</div>

    <div>
      <span
        class=""
        v-for="(i, key) in list"
        :key="key"
      >
        <NuxtLink 
          :to="'/' + route + '/' + i.slug + '/'" 
          class="mr-4"
          v-if="i.visible"
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
            v-if="i.cover_th"
            :src="i.cover_th"
            class="inline text-xs w-[20px] mr-[6px]"
            :alt="i.title"
          />
          <img
            v-if="i.photo_th"
            :src="i.photo_th"
            class="inline text-xs w-[20px] mr-[6px]"
            :alt="i.title"
          />
          <span class="text-xs">{{ i.title }}</span>
        </NuxtLink>
      </span>
    </div>

  </div>
</template>

<style lang="scss"></style>
