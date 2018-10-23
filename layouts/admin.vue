<template>
  <v-app>

    <v-toolbar dense>

      <v-toolbar-items>
        <v-btn flat :to="siteBtn.url">
          <v-icon>{{ siteBtn.icon }}</v-icon>
          <span class="ml-2 hidden-sm-and-down">{{ siteBtn.title }}</span>
        </v-btn>
      </v-toolbar-items>

      <v-spacer/>

      <v-toolbar-items>
        <v-btn flat v-if="!userIsAuthenticated" :to="signInBtn.url">
          <v-icon>{{ signInBtn.icon }}</v-icon>
          <span class="ml-2 hidden-sm-and-down">{{ signInBtn.title }}</span>
        </v-btn>

        <v-btn flat v-if="!userIsAuthenticated" :to="signUpBtn.url">
          <v-icon>{{ signUpBtn.icon }}</v-icon>
          <span class="ml-2 hidden-sm-and-down">{{ signUpBtn.title }}</span>
        </v-btn>

        <v-btn flat v-if="userIsAuthenticated" :to="adminBtn.url" exact>
          <v-icon>{{ adminBtn.icon }}</v-icon>
          <span class="ml-2 hidden-sm-and-down">{{ adminBtn.title }}</span>
        </v-btn>

        <v-btn flat v-if="userIsAuthenticated" :to="profileBtn.url">
          <v-icon>{{ profileBtn.icon }}</v-icon>
          <span class="ml-2 hidden-sm-and-down">{{ profileBtn.title }}</span>
        </v-btn>
      </v-toolbar-items>

      <v-spacer class="hidden-sm-and-up"/>

      <v-toolbar-side-icon @click.stop="sideNav = !sideNav" class="hidden-sm-and-up">
        <v-icon>mdi-menu</v-icon>
      </v-toolbar-side-icon>

    </v-toolbar>

    <v-content>
      <v-container>
        <nuxt/>
      </v-container>
    </v-content>

    <v-navigation-drawer
      fixed
      temporary
      right
      v-model="sideNav"
    >
      <v-list dense class="pt-0">

        <v-list-tile v-if="!userIsAuthenticated" :to="signInBtn.url">
          <v-list-tile-action>
            <v-icon>{{ signInBtn.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ signInBtn.title }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile v-if="!userIsAuthenticated" :to="signUpBtn.url">
          <v-list-tile-action>
            <v-icon>{{ signUpBtn.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ signUpBtn.title }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile :to="adminBtn.url" exact>
          <v-list-tile-action>
            <v-icon>{{ adminBtn.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ adminBtn.title }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile :to="profileBtn.url">
          <v-list-tile-action>
            <v-icon>{{ profileBtn.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ profileBtn.title }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

      </v-list>
    </v-navigation-drawer>

  </v-app>
</template>

<script>
  export default {
    data () {
      return {
        sideNav: null,
        siteBtn: {
          title: 'Site',
          icon: 'mdi-earth',
          url: '/'
        },
        signInBtn: {
          title: 'Login',
          icon: 'mdi-key',
          url: '/admin/user/login'
        },
        signUpBtn: {
          title: 'Registration',
          icon: 'mdi-account-plus',
          url: '/admin/user/register'
        },
        profileBtn: {
          title: 'Profile',
          icon: 'mdi-account',
          url: '/admin/user/profile'
        },
        adminBtn: {
          title: 'Админ',
          icon: 'mdi-security',
          url: '/admin'
        }
      }
    },
    computed: {
      userIsAuthenticated () {
        return this.$store.getters.userIsAuthenticated
      }
    },
    methods: {
      logout () {
        this.$store.dispatch('signOut').then(() => {
          alert('logged out!')
          this.$router.push('/')
        })
      }
    }
  }
</script>

<style>
</style>
