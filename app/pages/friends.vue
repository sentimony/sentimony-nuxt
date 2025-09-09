<script setup lang="ts">
import { toArray } from '~/composables/toArray'

const { data: friendsRaw } = await useFriends()
const friends = computed(() => toArray(friendsRaw.value, 'friends'))
</script>

<template>
  <div class="text-center">
    <h1 class="text-lg mb-10">
      <!-- <Icon name="mdi:event" width="24" height="24" /> -->
      Friends
    </h1>

    <span v-for="i in friends" :key="i.slug">
      <NuxtLink
        :to="'/friend/' + i.slug"
        class="mr-4"
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
        <span class="text-xs">{{ i.title }}</span>
      </NuxtLink>
    </span>

  </div>
</template>

<style lang="scss"></style>
