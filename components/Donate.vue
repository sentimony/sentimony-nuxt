<template>
  <div class="donate">
    <div class="donate__wrapper">
      <p>Recently all Sentimony Records releases available for free download.<br>We will be grateful for your feedback at <a href="https://sentimony.bandcamp.com" target="_blank" rel="noopener">Bandcamp</a>.</p>
      <p>Donations are very welcome!<br>It is not an easy mission to keep the free music flowing.</p>
      <p>{{ donateThanks }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    donateThanks: 'Huge Thanks for Support!'
  })
}
</script>

<style lang="scss">
.donate {
  position: relative;
  color: #000;
  background-color: #fff;
  background-image: url(https://sentimony.com/assets/img/backgrounds/donate.svg);
  background-position: center bottom;
  background-repeat: no-repeat;

  &__wrapper {
    max-width: 555px;
    margin: 0 auto;
    padding: 5em 10px;
    box-sizing: border-box;

    p {
        text-shadow: 0 2px 2px #fff,
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
