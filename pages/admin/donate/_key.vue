<template>
  <v-card>
    <v-card-text>
      <h1 class="headline">View Page Data</h1>
      <div>data: {{ page.data }}</div>
    </v-card-text>
  </v-card>
</template>

<script>
  export default {
    computed: {
      loading () {
        return this.$store.getters.loading
      },
      page () {
        return this.$store.getters.loadedDoanteSection(this.$route.params.key)
      }
    }
  }
</script>

<style>
</style>
