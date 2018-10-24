<template>
  <v-layout>
    <v-flex xs12>
      <nuxt-child :key="$router.fullPath"/>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    layout: 'admin',
    data () {
      return {
      }
    }
  }
</script>

<style>
</style>
