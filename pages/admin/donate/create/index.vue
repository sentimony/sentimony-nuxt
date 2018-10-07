<template>
  <v-card>
    <form @submit.prevent="onCreatePage">
      <v-card-text>
        <h1 class="headline">Create New Page</h1>
        <v-text-field
          name="data"
          label="Data"
          id="data"
          v-model="data"
          type="data"
          autocomplete="data"
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
        data: ''
      }
    },
    computed: {
      formIsValid () {
        return this.data !== ''
      }
    },
    methods: {
      onCreatePage () {
        if (!this.formIsValid) {
          return
        }
        const pageData = {
          data: this.data
        }
        this.$store.dispatch('createDonateSection', pageData)
        this.$router.push('/admin/donate')
      }
    }
  }
</script>

<style>
</style>
