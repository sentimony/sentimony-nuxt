<script setup lang="ts">
const { data: tagTypesData } = await useTagTypes()
const { data: tagsData } = await useTags({ limit: 100 })

// Group tags by type
const tagsByType = computed(() => {
  if (!tagsData.value?.results || !tagTypesData.value?.results) return []

  const types = tagTypesData.value.results
  const tags = tagsData.value.results

  return types.map((type) => ({
    type,
    tags: tags.filter((tag) => tag.type?.slug === type.slug),
  })).filter((group) => group.tags.length > 0)
})

const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()

const PageTitle = 'Tags'
const PageDescription = 'Browse releases by tags: musicians, music styles, and countries. Find psytrance, darkprog, psychill releases and more.'

useSeoMeta({
  title: PageTitle,
  description: PageDescription,
  ogTitle: PageTitle,
  ogDescription: PageDescription,
  ogImage: appConfig.brand.defaultOgImage,
  ogUrl: () => absoluteUrl.value,
  twitterTitle: PageTitle,
  twitterDescription: PageDescription,
  twitterImage: appConfig.brand.defaultOgImage,
  twitterCard: 'summary',
})
</script>

<template>
  <div class="container max-w-[112rem]">
    <h1 class="text-2xl md:text-4xl my-4 md:my-6">{{ PageTitle }}</h1>

    <template v-for="group in tagsByType" :key="group.type.slug">
      <h2 class="">{{ group.type.title_plural }}</h2>
      <div class="flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]">
        <TagItem
          v-for="tag in group.tags"
          :key="tag.slug"
          :tag="tag"
        />
      </div>
    </template>

    <!-- Empty state -->
    <div
      v-if="tagsByType.length === 0"
      class="text-center py-12 text-white/50"
    >
      No tags found
    </div>
  </div>
</template>
