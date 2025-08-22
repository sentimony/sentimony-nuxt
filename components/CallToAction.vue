<template>
  <div class="CallToAction">
    <img class="CallToAction__bg" src="/geometrical-pussy.svg" alt="CallToAction bg" />
    <div class="CallToAction__wrapper">
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
      <!-- <p><i>—Ihor</i></p> -->
      <p>— Ihor</p>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    youtube_url: 'https://www.youtube.com/@SentimonyRecords?sub_confirmation=1',
    soundcloud_url: 'https://soundcloud.com/sentimony',
    bandcamp_url: 'https://sentimony.bandcamp.com/follow_me',
  })
}
</script>

<style lang="scss">
@use '@/assets/scss/coriolanMedia' as media;

.CallToAction {
  position: relative;
  color: #000;
  background-color: #fff;
  // background-color: rgba(#fff, .66);
  overflow: hidden;
  // opacity: .77;

  &__bg {
    position: absolute;
    bottom: 0;
    transform: translateX(-50%);
    left: 50%;
    // transform: translate(-50%, -50%);
    // opacity: .66;
    // z-index: -1;
  }

  &__wrapper {
    max-width: 500px;
    margin: 0 auto;
    box-sizing: border-box;
    position: relative;
    text-align: left;
    padding-left: 0.6em;
    padding-right: 0.6em;
    padding-top: 30px;
    padding-bottom: 30px;

    @include media.media(M) {
      padding-top: 60px;
      padding-bottom: 60px;
    }

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
