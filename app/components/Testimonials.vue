<script setup lang="ts">
const youtube_url = 'https://www.youtube.com/@SentimonyRecords?sub_confirmation=1'
const soundcloud_url = 'https://soundcloud.com/sentimony'
const bandcamp_url = 'https://sentimony.bandcamp.com/follow_me'
</script>

<template>
  <!-- <div class="relative bg-sage-alt overflow-hidden"> -->
  <div class="relative !bg-sage-alt overflow-hidden">
    <NuxtImg
      src="https://content.sentimony.com/assets/img/svg-images/mandala-01.svg"
      class="absolute inset-0 z-0 object-cover w-full h-full pointer-events-none"
      alt=""
      aria-hidden="true"
    />
    <div class="relative  px-4 py-8 md:py-16 box-border">
      <div class="text-left mx-auto max-w-lg p-4 rounded-lg text-black border border-black/5 [&>p>a]:text-blue-500 hover:[&>p>a]:text-blue-400 backdrop-blur-md bg-sage">
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
