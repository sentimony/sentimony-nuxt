<template>
  <div class="donate relative">
    <img class="donate__bg" src="~/static/donate-bg.svg" alt="donate bg" />
    <div class="donate__wrapper px-2 py-[30px] md:py-[60px]">
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
  // @import '../node_modules/coriolan-ui/tools/variables';
  // @import '../node_modules/coriolan-ui/mixins/media';

  .donate {
    // position: relative;
    color: #000;
    background-color: #fff;
    // background-color: #e0ebe0;
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
      // padding-left: 0.6em;
      // padding-right: 0.6em;
      // padding-top: 30px;
      // padding-bottom: 30px;

      // @include media(M) {
      //   padding-top: 60px;
      //   padding-bottom: 60px;
      // }

      p {
        text-shadow: 0 2px 2px #fff, 0 -2px 2px #fff, 2px 0 2px #fff,
          -2px 0 2px #fff;

        a {
          color: #0046ff;
        }
      }
    }
  }
</style>
