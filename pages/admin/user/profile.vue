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
            <p>Your ID:<br><i>{{ user.uid }}</i></p>
            <p>Your Email:<br><i>{{ user.email }}</i></p>
          </div>

        </v-card-text>

        <v-card-actions>

          <v-spacer/>

          <v-btn @click="onLogout">
            <v-icon left>{{ logoutBtn.icon }}</v-icon>
            {{ logoutBtn.title }}
          </v-btn>

        </v-card-actions>

      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    layout: 'admin',
    data () {
      return {
        logoutBtn: {
          title: 'Logout',
          icon: 'mdi-exit-to-app'
        }
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
        this.$store.dispatch('logOut')
        this.$router.push('/admin')
      }
    },
    head: {
      title: 'Profile',
      meta: [
        { name: 'description', content: '' },
        { property: 'og:image', content: '' }
      ]
    }
  }
</script>

<style>
</style>
