<script setup lang="ts">
const touch = "Let's be in touch:"
const mailtoUrl = 'mailto:sentimony@gmail.com?subject=Hello, Sentimony Records'
const email = 'sentimony@gmail.com'

const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
const PageTitle = 'Contacts'
const PageDescription = 'Contact Sentimony Records for demos, bookings, licensing and partnerships. Reach our team via email — we reply to relevant inquiries.'
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
  <div class="container">

    <h1 class="text-2xl md:text-4xl my-4 md:my-6">{{ PageTitle }}</h1>

    <div class=" pb-[30px] md:pb-[60px]">
      <p>{{ touch }}</p>
      <p><a :href="mailtoUrl">{{ email }}</a></p>
    </div>

</div>
</template>
