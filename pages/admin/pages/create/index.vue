<template>
  <v-card>
    <form @submit.prevent="onCreatePage">
      <v-card-text>
        <h1 class="headline">Create New Page</h1>
        <v-text-field
          name="title"
          label="Title"
          id="title"
          v-model="title"
          type="title"
          autocomplete="title"
          required
        />
        <v-text-field
          name="slug"
          label="Slug"
          id="slug"
          v-model="slug"
          type="slug"
          autocomplete="slug"
          required
        />
      </v-card-text>
      <v-card-actions>
        <v-btn
          class="ml-0"
          color="success"
          large
          :disabled="!formIsValid"
          type="submit"
        >
          <v-icon left>mdi-plus</v-icon>
          Create
        </v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script>
  export default {
    data () {
      return {
        title: '',
        slug: ''
      }
    },
    computed: {
      formIsValid () {
        return this.title !== '' && this.slug !== ''
      }
    },
    methods: {
      onCreatePage () {
        if (!this.formIsValid) {
          return
        }
        const pageData = {
          date: new Date(),
          title: this.title,
          slug: this.slug
        }
        this.$store.dispatch('createPage', pageData)
        this.$router.push('/admin/pages')
      }
    }
  }
</script>

<style>
</style>
