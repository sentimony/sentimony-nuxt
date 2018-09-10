<template>
  <section>
    <div>
      <h1 class="title">Releases</h1>

      <v-btn color="success" class="ml-0" :to="createReleaseBtn.url">
        <v-icon left>{{ createReleaseBtn.icon }}</v-icon>
        {{ createReleaseBtn.title }}
      </v-btn>

      <v-progress-circular
        v-if="loading"
        indeterminate
        :size="40"
        color="amber"
      />

      <div v-else>
        <div v-for="i in releases" :key="i.id">
          {{ i.title }} | {{ i.date }} | {{ i.id }}
        </div>
      </div>

    </div>
  </section>
</template>

<script>
  export default {
    data () {
      return {
        createReleaseBtn: {title: 'Add new release', icon: 'mdi-plus', url: '/admin/create/release'}
      }
    },
    computed: {
      loading () {
        return this.$store.getters.loading
      },
      releases () {
        return this.$store.getters.loadedReleases.reverse()
      }
    }
  }
</script>

<style>
</style>
