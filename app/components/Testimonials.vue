<script setup lang="ts">
const youtube_url = 'https://www.youtube.com/@SentimonyRecords?sub_confirmation=1'
const soundcloud_url = 'https://soundcloud.com/sentimony'
const bandcamp_url = 'https://sentimony.bandcamp.com/follow_me'
</script>

<template>
  <div class="relative Content text-black !bg-[#a1c0a1] overflow-hidden bg-[url('https://content.sentimony.com/assets/img/svg-images/mandala-01.svg')] bg-center bg-no-repeat bg-cover bg-fixed">
    <!-- <img class="absolute bottom-0 left-1/2 -translate-x-1/2" src="https://content.sentimony.com/assets/img/svg-images/mandala-01.svg" alt="Triangles Bg" /> -->
    <div class="relative mx-auto px-2 py-[30px] md:py-[60px] box-border text-left max-w-lg [&>p>a]text-shadow-lg text-shadow-white">
      <p class="drop-shadow-md">My fellow artists and I always love reading your feedback.</p>
      <p class="drop-shadow-md">
        Find your favorite track and share your thoughts in the comments on our
        <a :href="youtube_url" target="_blank" rel="noopener">YouTube</a>,
        <a :href="soundcloud_url" target="_blank" rel="noopener">SoundCloud</a>
        or
        <a :href="bandcamp_url" target="_blank" rel="noopener">Bandcamp</a>
        pages.
      </p>
      <p class="drop-shadow-md">Thank you — I truly appreciate it ❤️</p>
      <p class="drop-shadow-md">— Ihor</p>
    </div>
  </div>
</template>
