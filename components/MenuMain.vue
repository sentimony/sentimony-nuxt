<template>
  <div class="menu-main">
    <div class="menu-main__wrapper">
      <div class="menu-main__list">
        <router-link v-touch-ripple to="/" class="menu-main__link" active-class="is-selected" exact>Home</router-link>
        <router-link v-touch-ripple to="/news/" class="menu-main__link" active-class="is-selected">News</router-link>
        <router-link v-touch-ripple to="/releases/" class="menu-main__link" active-class="is-selected">Releases</router-link>
        <router-link v-touch-ripple to="/artists/" class="menu-main__link" active-class="is-selected">Artists</router-link>
        <router-link v-touch-ripple to="/events/" class="menu-main__link" active-class="is-selected">Events</router-link>
        <router-link v-touch-ripple to="/friends/" class="menu-main__link" active-class="is-selected">Friends</router-link>
        <router-link v-touch-ripple to="/contacts/" class="menu-main__link" active-class="is-selected">Contacts</router-link>
      </div>
    </div>
  </div>
</template>

<script>
</script>

<style lang="scss">
.menu-main {
  margin: 0 auto 2em;

  &__wrapper {
    display: inline-block;
  }

  &__list {
    border: 1px solid rgba(#fff,.1);
    border-width: 1px 0;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }

  &__link {
    padding: .6em;
    background-color: rgba(#fff,.0);
    transition: background-color .2s ease;

    &.is-selected,
    &:hover {
      background-color: rgba(#fff,.1);
    }
  }
}
</style>
