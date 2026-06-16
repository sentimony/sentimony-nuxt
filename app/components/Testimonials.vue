<script setup lang="ts">
const youtube_url = 'https://www.youtube.com/@SentimonyRecords?sub_confirmation=1'
const soundcloud_url = 'https://soundcloud.com/sentimony'
const bandcamp_url = 'https://sentimony.bandcamp.com/follow_me'

const linkClass = "inline-flex items-center gap-1 align-middle rounded-md border border-emerald-700/30 bg-emerald-700/10 px-2 py-0.5 text-[13px] font-medium text-emerald-700 transition-colors hover:bg-emerald-700/20 hover:text-emerald-900 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-300 dark:hover:bg-emerald-300/20 dark:hover:text-emerald-100"
</script>

<template>
  <div class="px-4 py-8 md:py-16 box-border bg-gradient-to-t from-transparent via-transparent to-white/50 dark:to-black/50">
    <div class="text-left mx-auto max-w-lg p-4 rounded-lg backdrop-blur-sm bg-[#b5ccb5] border border-black/20 text-black dark:bg-[#2a4030] dark:border-white/20 dark:text-white">
      <NuxtLink to="/artist/irukanji" class="float-left mr-3 mb-1">
        <img
          src="https://content.sentimony.com/assets/img/artists/irukanji-01_xl.jpg"
          alt="Irukanji avatar"
          width="72" height="72"
          class="size-18 rounded-full object-cover ring-1 ring-black/20 dark:ring-white/20"
        >
      </NuxtLink>
      <p>My fellow artists and I always love reading your feedback.</p>
      <p>
        Find your favorite track and share your thoughts in the comments on our
        <a :href="youtube_url" target="_blank" rel="noopener" :class="linkClass"><Icon name="simple-icons:youtube" />YouTube<Icon name="lucide:arrow-up-right" size="12" /></a>,
        <a :href="soundcloud_url" target="_blank" rel="noopener" :class="linkClass"><Icon name="simple-icons:soundcloud" />SoundCloud<Icon name="lucide:arrow-up-right" size="12" /></a>
        or
        <a :href="bandcamp_url" target="_blank" rel="noopener" :class="linkClass"><Icon name="simple-icons:bandcamp" />Bandcamp<Icon name="lucide:arrow-up-right" size="12" /></a>
        pages.
      </p>
      <p>Thank you - I truly appreciate it <Icon name="lucide:heart" mode="svg" class="inline-block align-middle [&_path]:fill-current text-red-400 dark:text-red-500" /></p>
      <p>- Ihor</p>
    </div>
  </div>
</template>
