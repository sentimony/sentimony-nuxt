<script setup lang="ts">
const youtube_url = 'https://www.youtube.com/@SentimonyRecords?sub_confirmation=1'
const soundcloud_url = 'https://soundcloud.com/sentimony'
const bandcamp_url = 'https://sentimony.bandcamp.com/follow_me'
</script>

<template>
  <div class="CallToAction relative">
    <img class="CallToAction__bg" src="/images/geometrical-pussy.svg" alt="CallToAction bg" />
    <div class="CallToAction__wrapper px-2 py-[30px] md:py-[60px]">
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
</template>

<style lang="scss">
.CallToAction {
  color: #000;
  background-color: #fff;
  overflow: hidden;

  &__bg {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    display: inline-block;
  }

  &__wrapper {
    max-width: 500px;
    margin: 0 auto;
    box-sizing: border-box;
    position: relative;
    text-align: left;

    p {
      text-shadow: 
        0 2px 2px #fff, 
        0 -2px 2px #fff, 
        2px 0 2px #fff,
        -2px 0 2px #fff;

      a {
        color: #0046ff;
      }
    }
  }
}
</style>
