<script setup lang="ts">
const { data: releasesRaw } = await useReleases()
const releases = computed(() => toArray(releasesRaw.value, 'releases'))
const releasesSortedByDate = computed(() =>
  [...releases.value]
    .filter((r: any) => Boolean(r?.visible))
    .sort((a: any, b: any) =>
      new Date(b?.date ?? 0).getTime() - new Date(a?.date ?? 0).getTime()
    )
)
const PageTitle = 'Releases';
useSeoMeta({
  title: PageTitle,
  description: PageTitle + ' of Sentimony Records',
  ogImage: '',
});
</script>

<template>
  <div class="container">

    <h1 class="mb-4">{{ PageTitle }}</h1>

    <div class="flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]">
      <Item
        v-for="i in releasesSortedByDate"
        :key="i.slug"
        category="release"
        :i="i"
      />
    </div>

  </div>
</template>

<style lang="scss"></style>
