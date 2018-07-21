<template>
  <div>
    <h1 class="title">Admin Dashboard</h1>
    <h2 class="subheading">The routes below are are using <code>nuxt-child</code></h2>

    <v-flex xs12 id="adminNav">
      <nuxt-link class="adminNavRoute" to="/admin">Dashboard Home</nuxt-link>
      <br>
      <nuxt-link class="adminNavRoute" to="/admin/settings">Settings</nuxt-link>
      <br>
      <nuxt-link class="adminNavRoute" to="/admin/items">Database Example</nuxt-link>
    </v-flex>

    <v-divider></v-divider>

    <v-flex id="adminChild" xs12>
      <nuxt-child :key="$router.fullPath"></nuxt-child>
    </v-flex>

  </div>
</template>

<script>
</script>

<style>
</style>
