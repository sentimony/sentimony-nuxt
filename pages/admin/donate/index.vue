<template>
  <v-card>
    <v-card-text>

      <h1 class="headline">News</h1>

      <v-btn color="success" class="ml-0" :to="createPageBtn.url">
        <v-icon left>{{ createPageBtn.icon }}</v-icon>
        {{ createPageBtn.title }}
      </v-btn>

      <v-progress-circular
        v-if="loading"
        indeterminate
        :size="40"
        color="amber"
      />

      <div v-else>
        <div v-for="i in doante" :key="i.id">
          <a @click="onLoadPage(i.id)">{{ i.data }}</a>
        </div>
      </div>

    </v-card-text>
  </v-card>
</template>

<script>
  export default {
    data () {
      return {
        createPageBtn: {title: 'Create Donate', icon: 'mdi-plus', url: '/admin/donate/create'}
      }
    },
    computed: {
      loading () {
        return this.$store.getters.loading
      },
      doante () {
        return this.$store.getters.loadedDoanteSections
      }
    },
    methods: {
      onLoadPage (id) {
        this.$router.push('/admin/donate/' + id)
      },
      // onEditPage (id) {
      //   this.$router.push('/admin/pages/edit/' + id)
      // }
    }
  }
</script>

<style>
</style>
