<template>
  <v-layout>
    <v-flex xs12 sm8 offset-sm2>
      <v-card>
        <v-card-title class="headline">Profile</v-card-title>
        <v-card-text>
          <v-progress-circular
            v-if="loading"
            indeterminate
            :size="40"
            color="amber"
          />
          <div v-else>
            <p>Your ID: <i>{{ $store.getters.user.id }}</i></p>
            <p>Your Email: <i>{{ $store.getters.user.email }}</i></p>
          </div>

          <v-flex xs12 class="text-xs-right">
            <v-btn flat class="mx-0" @click="onLogout">
              <v-icon left>{{ logoutBtn.icon }}</v-icon>
              {{ logoutBtn.title }}
            </v-btn>
          </v-flex>

        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    data () {
      return {
        logoutBtn: {title: 'Logout', icon: 'mdi-exit-to-app'}
      }
    },
    computed: {
      user () {
        return this.$store.getters.user
      },
      loading () {
        return this.$store.getters.loading
      }
    },
    methods: {
      onLogout () {
        this.$store.dispatch('logout')
        this.$router.push('/')
      }
    }
  }
</script>

<style>
</style>
