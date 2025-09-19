<script setup lang="ts">
const { data: friendsRaw } = await useFriends()
const friends = computed(() => toArray(friendsRaw.value, 'friends'))
const friendsSortedByDate = computed(() =>
  [...friends.value]
    .filter((r: any) => Boolean(r?.visible))
    .sort((a: any, b: any) =>
      new Date(b?.date ?? 0).getTime() - new Date(a?.date ?? 0).getTime()
    )
)

const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
const PageTitle = 'Friends'
const PageDescription = 'Friends and partners of Sentimony Records: labels, promoters, media and allies supporting psytrance darkprog and psychill culture.'
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
  twitterCard: 'summary'
})
</script>

<template>
  <div class="container max-w-[112rem]">

    <h1 class="text-2xl md:text-4xl my-4 md:my-6">{{ PageTitle }}</h1>

    <div class=" pb-[30px] md:pb-[60px]">
      <p
        v-for="i in friendsSortedByDate"
        :key="i.slug"
      >
        <NuxtLink
          :to="'/friend/' + i.slug"
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
          <span class="">{{ i.title }}</span>
        </NuxtLink>
      </p>
    </div>

  </div>
</template>

<style lang="scss"></style>
