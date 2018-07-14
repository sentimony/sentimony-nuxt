<template>
  <v-layout>
    <v-flex xs12 sm6 offset-sm3 lg4 offset-lg4>

      <alert v-if="error" @dismissed="onDismissed" :text="error.message"/>

      <v-card>

        <v-card-title class="headline">Sign In</v-card-title>

        <v-card-text>

          <form @submit.prevent="onSignin">
            <v-text-field
              name="email"
              label="Email"
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
            />

            <v-text-field
              name="password"
              label="Пароль"
              id="password"
              v-model="password"
              type="password"
              autocomplete="password"
              required
            />

            <div>
              <v-btn
                class="ml-0"
                color="success"
                large
                :loading="loading"
                :disabled="loading"
                type="submit"
              >Sign In</v-btn>
            </div>
          </form>

          <br>
          <router-link to="/user/signup">No account yet?</router-link>

        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
  import Alert from '~/components/Alert'

  export default {
    components: {
      Alert
    },
    data () {
      return {
        email: '',
        password: ''
      }
    },
    computed: {
      user () {
        return this.$store.getters.user
      },
      error () {
        return this.$store.getters.error
      },
      loading () {
        return this.$store.getters.loading
      }
    },
    watch: {
      user (value) {
        if (value !== null && value !== undefined) {
          this.$router.push('/')
        }
      }
    },
    methods: {
      onSignin () {
        this.$store.dispatch('signUserIn', {
          email: this.email,
          password: this.password
        })
      },
      onDismissed () {
        this.$store.dispatch('clearError')
      }
    }
  }
</script>

<style>
</style>
