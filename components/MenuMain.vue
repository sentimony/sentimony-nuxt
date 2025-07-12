<template>
  <div class="menu-main">
    <div class="menu-main__wrapper">
      <div class="menu-main__list">
        <router-link
          v-ripple
          to="/"
          class="menu-main__link"
          active-class="is-selected"
          exact
          >Home</router-link
        >
        <router-link
          v-ripple
          to="/news/"
          class="menu-main__link"
          active-class="is-selected"
          >News</router-link
        >
        <router-link
          v-ripple
          to="/releases/"
          class="menu-main__link"
          active-class="is-selected"
          >Releases</router-link
        >
        <router-link
          v-ripple
          to="/artists/"
          class="menu-main__link"
          active-class="is-selected"
          >Artists</router-link
        >
        <router-link
          v-ripple
          to="/videos/"
          class="menu-main__link"
          active-class="is-selected"
          >Videos</router-link
        >
        <router-link
          v-ripple
          to="/playlists/"
          class="menu-main__link"
          active-class="is-selected"
          >Playlists</router-link
        >
        <router-link
          v-ripple
          to="/events/"
          class="menu-main__link"
          active-class="is-selected"
          >Events</router-link
        >
        <router-link
          v-ripple
          to="/friends/"
          class="menu-main__link"
          active-class="is-selected"
          >Friends</router-link
        >
        <router-link
          v-ripple
          to="/contacts/"
          class="menu-main__link"
          active-class="is-selected"
          >Contacts</router-link
        >
        <!-- <router-link v-ripple to="/tracks/" class="menu-main__link" active-class="is-selected">Tracks</router-link> -->
        <!-- <router-link v-ripple to="/sitemap/" class="menu-main__link" active-class="is-selected">Sitemap</router-link> -->
      </div>
    </div>
  </div>
</template>

<script></script>

<style lang="scss">
  .menu-main {
    margin: 0 auto 2em;

    &__wrapper {
      display: inline-block;
    }

    &__list {
      border: 1px solid rgba(#fff, 0.1);
      border-width: 1px 0;
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
    }

    &__link {
      padding: 0.6em;
      background-color: rgba(#fff, 0);
      transition: background-color 0.2s ease;

      &.is-selected,
      &:hover {
        background-color: rgba(#fff, 0.1);
      }
    }
  }
</style>
