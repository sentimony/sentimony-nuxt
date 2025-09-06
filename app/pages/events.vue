<script setup lang="ts">
const { data: eventsRaw } = await useEvents()
const events = computed(() => toArray(eventsRaw.value, 'events'))
const eventsSortedByDate = computed(() =>
  [...events.value]
    .filter((r: any) => Boolean(r?.visible))
    .sort((a: any, b: any) =>
      new Date(b?.date ?? 0).getTime() - new Date(a?.date ?? 0).getTime()
    )
)
const PageTitle = 'Events';
useSeoMeta({
  title: PageTitle,
  description: PageTitle + ' of Sentimony Records',
  ogImage: '',
});

const { formatDate } = useDate()
</script>

<template>
  <div class="px-1 pb-[30px] md:pb-[60px]">

    <h1 class="mb-4">{{ PageTitle }}</h1>

    <p
      v-for="i in eventsSortedByDate"
      :key="i.slug"
    >
      <NuxtLink 
        :to="'/event/' + i.slug + '/'" 
        class=""
        v-wave
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
        <span class="">{{ formatDate(i.date) }} @ {{ i.title }}</span>
      </NuxtLink>
    </p>

  </div>
</template>

<style lang="scss"></style>
