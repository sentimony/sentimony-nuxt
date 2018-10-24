<template>
  <v-card>
    <v-card-text>

      <h1 class="headline">News</h1>

      <v-btn color="success" class="ml-0" :to="createBtn.url">
        <v-icon left>{{ createBtn.icon }}</v-icon>
        {{ createBtn.title }}
      </v-btn>

      <v-progress-circular
        v-if="loading"
        indeterminate
        :size="40"
        color="amber"
      />

      <div v-else>
        <div v-for="i in news" :key="i.id">
            id: {{ i.id }}<br>
            date: {{ i.date }}<br>
            slug: {{ i.slug }}<br>
            title: {{ i.title }}<br>
            url: {{ i.url }}<br>
            <a @click="onLoad(i.slug)">View</a> |
            <a @click="onLoad(i.slug)">Edit</a>
            <br>
            <br>
        </div>
      </div>

    </v-card-text>
  </v-card>
</template>

<script>
  export default {
    data () {
      return {
        createBtn: {
          title: 'Create News Item',
          icon: 'mdi-plus',
          url: '/admin/news/create'
        }
      }
    },
    computed: {
      loading () {
        return this.$store.getters.loading
      },
      news () {
        return this.$store.getters.loadedNewsListSortedByDate
      }
    },
    methods: {
      onLoad (slug) {
        this.$router.push('/admin/news/' + slug)
      },
      // onEditPage (id) {
      //   this.$router.push('/admin/pages/edit/' + id)
      // }
    }
  }
</script>

<style>
</style>
