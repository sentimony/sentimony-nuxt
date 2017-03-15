<template>
  <header class="header-menu">
    <nav class="header-menu__list">
      <nuxt-link class="header-menu__link" to='/' exact>About</nuxt-link>
      <nuxt-link class="header-menu__link" to='/releases'>Releases</nuxt-link>
      <nuxt-link class="header-menu__link" to='/contacts'>Contacts</nuxt-link>
      <a class="header-menu__link" href="https://sentimony.bandcamp.com" target="_blank">Bandcamp</a>
      <a class="header-menu__link" href="https://www.facebook.com/sentimony.records" target="_blank">Facebook</a>
    </nav>
  </header>
</template>

<style lang="scss">
.header-menu {
  background-color: #000;
  position: relative;
  z-index: 100;

  &__list {
    max-width: 666px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  &__link {
    font-weight: 600;
    text-transform: uppercase;
    padding: 1em 0;
    flex-basis: (100% / 5);
    transition: background-color .2s ease-in-out, color .2s ease-in-out;

    &.nuxt-link-active {
      background-color: #111;
    }
  }
}
</style>
