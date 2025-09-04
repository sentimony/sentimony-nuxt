<script setup lang="ts">
const touch = "Let's be in touch:"
const mailtoUrl = 'mailto:sentimony@gmail.com?subject=Hello, Sentimony Records'
const email = 'sentimony@gmail.com'

const PageTitle = 'Contacts'
useSeoMeta({
  title: PageTitle,
  description: PageTitle + ' of Sentimony Records',
  ogImage: '',
});
</script>

<template>
  <div class="px-1 pb-[30px] md:pb-[60px]">
    <h1 class="mb-4">{{ PageTitle }}</h1>
    <p class="contacts__title">{{ touch }}</p>
    <p><a :href="mailtoUrl">{{ email }}</a></p>
  </div>
</template>

<style lang="scss"></style>

