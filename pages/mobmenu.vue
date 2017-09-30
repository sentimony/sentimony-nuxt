<template>
  <div class="mobmenu">
    <nuxt-link to="/news/" class="mobmenu__link">News</nuxt-link>
    <nuxt-link to="/releases/" class="mobmenu__link">Releases</nuxt-link>
    <nuxt-link to="/artists/" class="mobmenu__link">Artists</nuxt-link>
    <nuxt-link to="/events/" class="mobmenu__link">Events</nuxt-link>
    <nuxt-link to="/friends/" class="mobmenu__link">Friends</nuxt-link>
    <nuxt-link to="/contacts/" class="mobmenu__link">Contacts</nuxt-link>
  </div>
</template>

<script>
export default {
  head: {
    title: 'MobMenu',
    meta: [
      { name: 'description', content: 'MobMenu description' }
    ]
  }
}
</script>

<style lang="scss">
.mobmenu {
  padding: 20px 0;

  &__link {
    display: block;
    padding: 20px 0;
  }
}
</style>
