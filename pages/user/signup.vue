<template>
  <v-layout>
    <v-flex xs12 sm6 offset-sm3 lg4 offset-lg4>

      <alert v-if="error" @dismissed="onDismissed" :text="error.message"/>

      <v-card>

        <v-card-title class="headline">Sign Up</v-card-title>

        <v-card-text>

          <form @submit.prevent="onSignup">
            <v-text-field
              v-model="email"
              name="email"
              label="Email"
              id="email"
              type="email"
              autocomplete="email"
              required
            />

            <v-text-field
              v-model="password"
              name="password"
              label="Пароль"
              id="password"
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
              >Sign Up</v-btn>
            </div>
          </form>

          <br>
          <router-link to="/user/signin">Already have an account?</router-link>

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
        password: '',
        confirmPassword: ''
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
      onSignup () {
        this.$store.dispatch('signUserUp', {
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
