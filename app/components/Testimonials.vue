<script setup lang="ts">
const youtube_url = 'https://www.youtube.com/@SentimonyRecords?sub_confirmation=1'
const soundcloud_url = 'https://soundcloud.com/sentimony'
const bandcamp_url = 'https://sentimony.bandcamp.com/follow_me'
</script>

<template>
  <!-- <div class="relative bg-[#a1c0a1] overflow-hidden"> -->
  <div class="relative !bg-[#a1c0a1] overflow-hidden bg-[url('https://content.sentimony.com/assets/img/svg-images/mandala-01.svg'),url('https://content.sentimony.com/assets/img/backgrounds/trees-origin_v1.jpg')] bg-center bg-no-repeat bg-cover bg-fixed">
    <!-- <img class="absolute bottom-0 left-1/2 -translate-x-1/2" src="https://content.sentimony.com/assets/img/svg-images/mandala-01.svg" alt="Triangles Bg" /> -->
    <div class="relative  px-4 py-8 md:py-16 box-border">
      <div class="text-left mx-auto max-w-lg p-4 rounded-lg backdrop-blur-md bg-white/70 border border-white/40 text-stone-800">
        <NuxtLink to="/artist/irukanji" class="float-left mr-3 mb-1">
          <img
            src="https://content.sentimony.com/assets/img/artists/irukanji-02_xl.jpg"
            alt="Irukanji avatar"
            width="72" height="72"
            class="size-18 rounded-full object-cover ring-1 ring-black/20"
          >
        </NuxtLink>
        <p>My fellow artists and I always love reading your feedback.</p>
        <p>
          Find your favorite track and share your thoughts in the comments on our
          <a :href="youtube_url" target="_blank" rel="noopener" class="inline-flex items-center gap-1 align-middle rounded-md border border-emerald-700/20 bg-emerald-600/10 px-2 py-0.5 text-[13px] font-medium text-emerald-700 transition-colors hover:bg-emerald-600/20 hover:text-emerald-900"><Icon name="simple-icons:youtube" />YouTube</a>,
          <a :href="soundcloud_url" target="_blank" rel="noopener" class="inline-flex items-center gap-1 align-middle rounded-md border border-emerald-700/20 bg-emerald-600/10 px-2 py-0.5 text-[13px] font-medium text-emerald-700 transition-colors hover:bg-emerald-600/20 hover:text-emerald-900"><Icon name="simple-icons:soundcloud" />SoundCloud</a>
          or
          <a :href="bandcamp_url" target="_blank" rel="noopener" class="inline-flex items-center gap-1 align-middle rounded-md border border-emerald-700/20 bg-emerald-600/10 px-2 py-0.5 text-[13px] font-medium text-emerald-700 transition-colors hover:bg-emerald-600/20 hover:text-emerald-900"><Icon name="simple-icons:bandcamp" />Bandcamp</a>
          pages.
        </p>
        <p>Thank you - I truly appreciate it <Icon name="lucide:heart" mode="svg" class="inline-block align-middle [&_path]:fill-current text-red-500" /></p>
        <p>- Ihor</p>
      </div>
    </div>
  </div>
</template>
