<template>
  <v-card>
    <v-card-text>
      <!-- <v-flex> -->
        <h1 class="headline">Donate Section</h1>
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
        <div v-for="i in doanteSections" :key="i.id">
          <a @click="onLoadPage(i.id)">{{ i.data }}</a>
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
        createPageBtn: {title: 'Create Donate Section', icon: 'mdi-plus', url: '/admin/donate/create'}
      }
    },
    computed: {
      loading () {
        return this.$store.getters.loading
      },
      doanteSections () {
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
