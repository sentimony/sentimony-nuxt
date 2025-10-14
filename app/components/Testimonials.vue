<script setup lang="ts">
const youtube_url = 'https://www.youtube.com/@SentimonyRecords?sub_confirmation=1'
const soundcloud_url = 'https://soundcloud.com/sentimony'
const bandcamp_url = 'https://sentimony.bandcamp.com/follow_me'
</script>

<template>
  <div class="relative !bg-[#a1c0a1] overflow-hidden bg-[url('https://content.sentimony.com/assets/img/svg-images/mandala-01.svg')] bg-center bg-no-repeat bg-cover bg-fixed">
    <!-- <img class="absolute bottom-0 left-1/2 -translate-x-1/2" src="https://content.sentimony.com/assets/img/svg-images/mandala-01.svg" alt="Triangles Bg" /> -->
    <div class="relative  px-4 py-8 md:py-16 box-border">
      <div class="text-left mx-auto max-w-lg p-4 rounded-lg text-black border border-black/5 [&>p>a]:text-blue-500 hover:[&>p>a]:text-blue-400 backdrop-blur-md bg-[#a1c0a1]/80">
        <p>My fellow artists and I always love reading your feedback.</p>
        <p>
          Find your favorite track and share your thoughts in the comments on our
          <a :href="youtube_url" target="_blank" rel="noopener">YouTube</a>,
          <a :href="soundcloud_url" target="_blank" rel="noopener">SoundCloud</a>
          or
          <a :href="bandcamp_url" target="_blank" rel="noopener">Bandcamp</a>
          pages.
        </p>
        <p>Thank you — I truly appreciate it ❤️</p>
        <p>— Ihor</p>
      </div>
    </div>
  </div>
</template>
