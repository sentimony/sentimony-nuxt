<template>
  <v-layout>
    <v-flex xs12 sm8 offset-sm2>
      <v-card>
        <v-card-title class="headline">Profile</v-card-title>
        <v-card-text>
          <!-- <v-progress-circular
            v-if="loading"
            indeterminate
            :size="40"
            color="amber"
          />
          <div v-else>
            <p>Your ID: <i>{{ $store.getters.user.id }}</i></p>
            <p>Your Email: <i>{{ $store.getters.user.email }}</i></p>
          </div> -->

          <!-- <v-flex xs12 class="text-xs-right">
            <v-btn flat class="mx-0" @click="onLogout">
              <v-icon left>{{ logoutBtn.icon }}</v-icon>
              {{ logoutBtn.title }}
            </v-btn>
          </v-flex> -->


          <!-- <v-card> -->
            <v-list v-if="userIsAuthenticated">
              <v-list-tile avatar>
                <v-list-tile-avatar>
                  <img :src="$store.state.user.photoURL" alt="John">
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title v-if="$store.state.user.displayName">{{$store.state.user.displayName}}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>

              <v-divider></v-divider>

              <v-list-tile>
                <v-spacer></v-spacer>
                <v-list-tile-action>
                  <v-btn flat class="mt-2" @click.native="onLogout">
                    <v-icon left>{{ logoutBtn.icon }}</v-icon>
                    {{ logoutBtn.title }}
                  </v-btn>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
          <!-- </v-card> -->


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
      userIsAuthenticated () {
        return this.$store.getters.userIsAuthenticated
      }
    },
    methods: {
      onLogout () {
        this.$store.dispatch('logOut')
        this.$router.push('/')
      }
    }
  }
</script>

<style>
</style>
