<template>
  <v-container>
    <v-layout row wrap>
      <v-flex xs12 md10 offset-md1>
        <v-card>
          <form @submit.prevent="onCreateRelease">
            <v-card-text>
              <h1>Create Release</h1>
              <v-text-field
                name="title"
                label="Title"
                id="title"
                v-model="title"
                type="title"
                autocomplete="title"
                required
              />
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
            </v-card-text>
          </form>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  export default {
    data () {
      return {
        title: ''
      }
    },
    computed: {
      formIsValid () {
        return this.title !== ''
      }
    },
    methods: {
      onCreateRelease () {
        if (!this.formIsValid) {
          return
        }
        const releaseData = {
          date: new Date(),
          title: this.title
        }
        this.$store.dispatch('createRelease', releaseData)
        this.$router.push('/admin/releases')
      }
    }
  }
</script>

<style>
</style>
