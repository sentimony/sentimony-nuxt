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
        <div v-for="(i, key) in items" :key="i.slug">{{ i.title }}</div>
      </div>
    </div>
  </section>
</template>

<script>
  export default {
    // data () {
    //   return {
    //     id: this.item.id
    //   }
    // },
    data () {
      return {
        createReleaseBtn: {title: 'Add new release', icon: 'mdi-plus', url: '/admin/create/release'}
      }
    },
    computed: {
      loading () {
        return this.$store.getters.loading
      },
      items () {
        return this.$store.getters.loadedItems
      }
    }
  }
</script>

<style>
</style>
