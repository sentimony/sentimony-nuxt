<template>
  <v-card>
    <v-card-text>
      <!-- <v-flex> -->
        <h1 class="headline">Pages</h1>
        <!-- <v-spacer/> -->
        <v-btn color="success" class="ml-0" :to="createPageBtn.url">
          <v-icon left>{{ createPageBtn.icon }}</v-icon>
          {{ createPageBtn.title }}
        </v-btn>
      <!-- </v-flex> -->

      <v-progress-circular
        v-if="loading"
        indeterminate
        :size="40"
        color="amber"
      />

      <div v-else>
        <div v-for="i in pages" :key="i.id">
          <a @click="onLoadPage(i.id)">{{ i.title }}</a>
          <!-- <v-btn small flat icon @click="onEditPage(i.id)" :page="i.id">
            <v-icon small>mdi-pencil</v-icon>
          </v-btn> -->
          <!-- <v-icon small>mdi-delete</v-icon> -->
        </div>
      </div>

    </v-card-text>
    <!-- <v-card-actions>
    </v-card-actions> -->
  </v-card>
</template>

<script>
  export default {
    data () {
      return {
        createPageBtn: {title: 'Create New Page', icon: 'mdi-plus', url: '/admin/pages/create'}
      }
    },
    computed: {
      loading () {
        return this.$store.getters.loading
      },
      pages () {
        return this.$store.getters.loadedPages
      }
    },
    methods: {
      onLoadPage (id) {
        this.$router.push('/admin/pages/' + id)
      },
      // onEditPage (id) {
      //   this.$router.push('/admin/pages/edit/' + id)
      // }
    }
  }
</script>

<style>
</style>
