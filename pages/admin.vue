<template>
  <div>

    <v-flex xs12 id="adminNav">
      <nuxt-link class="adminNavRoute" to="/admin">Dashboard</nuxt-link>
      |
      <nuxt-link class="adminNavRoute" to="/admin/releases">Releases</nuxt-link>
      |
      <nuxt-link class="adminNavRoute" to="/admin/artists">Artists</nuxt-link>
    </v-flex>

    <v-divider></v-divider>

    <v-flex id="adminChild" xs12>
      <nuxt-child :key="$router.fullPath"></nuxt-child>
    </v-flex>

  </div>
</template>

<script>
  export default {
    layout: 'admin',
  }
</script>

<style>
</style>
