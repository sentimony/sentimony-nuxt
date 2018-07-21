<template>
  <v-app>

    <v-toolbar>
      <v-toolbar-items>
        <v-btn flat :to="homeBtn.url" exact>
          <v-icon>{{ homeBtn.icon }}</v-icon>
          <v-toolbar-title class="hidden-sm-and-down">{{ homeBtn.title }}</v-toolbar-title>
        </v-btn>
      </v-toolbar-items>

      <v-spacer/>

      <v-toolbar-items>
        <v-btn flat :to="releasesBtn.url">
          <v-icon>{{ releasesBtn.icon }}</v-icon>
          <v-toolbar-title class="hidden-xs-only">{{ releasesBtn.title }}</v-toolbar-title>
        </v-btn>

        <v-btn flat :to="artistsBtn.url">
          <v-icon>{{ artistsBtn.icon }}</v-icon>
          <span style="margin-left: 16px;" class="hidden-sm-and-down">{{ artistsBtn.title }}</span>
        </v-btn>
      </v-toolbar-items>

      <v-spacer/>

      <v-toolbar-side-icon @click.stop="sideNav = !sideNav" class="hidden-sm-and-up">
        <v-icon>mdi-menu</v-icon>
      </v-toolbar-side-icon>

      <v-toolbar-items class="main-menu hidden-xs-only">
        <v-btn flat v-if="!userIsAuthenticated" :to="signInBtn.url">
          <v-icon>{{ signInBtn.icon }}</v-icon>
          <span style="margin-left: 16px;" class="hidden-sm-and-down">{{ signInBtn.title }}</span>
        </v-btn>

        <v-btn flat v-if="!userIsAuthenticated" :to="signUpBtn.url">
          <v-icon>{{ signUpBtn.icon }}</v-icon>
          <span style="margin-left: 16px;" class="hidden-sm-and-down">{{ signUpBtn.title }}</span>
        </v-btn>

        <v-btn flat v-if="userIsAuthenticated" :to="adminBtn.url">
          <v-icon>{{ adminBtn.icon }}</v-icon>
          <span style="margin-left: 16px;" class="hidden-sm-and-down">{{ adminBtn.title }}</span>
        </v-btn>

        <v-btn flat v-if="userIsAuthenticated" :to="profileBtn.url">
          <v-icon>{{ profileBtn.icon }}</v-icon>
          <span style="margin-left: 16px;" class="hidden-sm-and-down">{{ profileBtn.title }}</span>
        </v-btn>

      </v-toolbar-items>
    </v-toolbar>

    <v-content>
      <v-container>
        <nuxt/>
      </v-container>
      <donate/>
    </v-content>


    <v-navigation-drawer
      fixed
      temporary
      right
      v-model="sideNav"
    >
      <v-list dense class="pt-0">

        <v-list-tile :to="homeBtn.url">
          <v-list-tile-action>
            <v-icon>{{ homeBtn.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ homeBtn.title }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile :to="releasesBtn.url">
          <v-list-tile-action>
            <v-icon>{{ releasesBtn.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ releasesBtn.title }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile :to="artistsBtn.url">
          <v-list-tile-action>
            <v-icon>{{ artistsBtn.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ artistsBtn.title }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

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

        <v-list-tile :to="adminBtn.url">
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
  import Donate from '~/components/Donate'

  export default {
    components: {
      Donate
    },
    data () {
      return {
        sideNav: null,
        homeBtn: {title: 'Sentimony Records', icon: 'mdi-robot', url: '/'},
        releasesBtn: {title: 'Releases', icon: 'mdi-yin-yang', url: '/releases'},
        artistsBtn: {title: 'Artists', icon: 'mdi-headset', url: '/artists'},
        signInBtn: {title: 'Sign In', icon: 'mdi-key', url: '/user/register'},
        signUpBtn: {title: 'Sign Up', icon: 'mdi-account-plus', url: '/user/login'},
        profileBtn: {title: 'Profile', icon: 'mdi-account', url: '/user/profile'},
        adminBtn: {title: 'Админ', icon: 'mdi-security', url: '/admin'}
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
