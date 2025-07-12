<template>
  <div class="donate">
    <img class="donate__bg" src="~/static/donate-bg.svg" alt="donate bg" />
    <div class="donate__wrapper">
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
      <p>—Ihor</p>
    </div>
  </div>
</template>

<script>
  export default {
    data: () => ({
      youtube_url:
        'https://www.youtube.com/@SentimonyRecords?sub_confirmation=1',
      soundcloud_url: 'https://soundcloud.com/sentimony',
      bandcamp_url: 'https://sentimony.bandcamp.com/follow_me'
    })
  }
</script>

<style lang="scss">
  .donate {
    position: relative;
    color: #000;
    background-color: #fff;
    // background-color: #e0ebe0;
    overflow: hidden;

    &__bg {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
    }

    &__wrapper {
      max-width: 500px;
      margin: 0 auto;
      padding: 5em 10px;
      box-sizing: border-box;
      position: relative;
      text-align: left;

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
