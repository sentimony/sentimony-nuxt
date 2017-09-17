<template>
  <footer class='footer-block'>
    <div>
      <nuxt-link to='/contacts'>Contacts</nuxt-link>
    </div>
    <div class='footer-block__copyright'>
      <div>2006 - 2017 © Sentimony Records</div>
      <div>All Rights Reserved</div>
    </div>
    <!-- <div class='footer-block__powered'>
      <a class='footer-block__powered-link' href='https://ihororlovskyi.com' target='_blank'>
      <img class='footer-block__powered-img' src="https://ihororlovskyi.com/assets/img/svg-icons/ihororlovskyi.svg">
        <span class='footer-block__powered-text'>Ihor Orlovskyi</span>
      </a>
    </div> -->
    <nav class='footer-block__versions'>
      <a href="https://sentimony.com">vue</a>
      <a href="https://nuxt.sentimony.com" class="is-selected">nuxt</a>
      <a href="https://gatsby.sentimony.com">gatsby</a>
    </nav>
  </footer>
</template>

<script>
</script>

<style lang="scss">
.footer-block {
  background-color: #000;
  padding: 1.2em .8em;
  position: relative;
  z-index: 30;
  font-weight: 100;

  &__copyright {
    font-size: .7em;
    margin-bottom: .8em;
  }

  // &__powered {
  //   text-align: center;

  //   &-link {
  //     display: flex;
  //     justify-content: center;
  //     align-items: center;
  //     transition: color .25s ease;
  //   }

  //   &-img {
  //     max-width: .9em;
  //   }

  //   &-text {
  //     text-align: left;
  //     font-size: .6em;
  //     font-weight: 300;
  //     padding-left: .8em;
  //   }
  // }

  &__versions {
    font-size: .5em;
    a {
      padding: .1em .5em;
      &.is-selected {
        color: #fff;
      }
    }
  }
}
</style>
