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
        <v-btn flat :to="signInBtn.url">
          <v-icon>{{ signInBtn.icon }}</v-icon>
          <span style="margin-left: 16px;" class="hidden-sm-and-down">{{ signInBtn.title }}</span>
        </v-btn>

        <v-btn flat :to="signUpBtn.url">
          <v-icon>{{ signUpBtn.icon }}</v-icon>
          <span style="margin-left: 16px;" class="hidden-sm-and-down">{{ signUpBtn.title }}</span>
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <v-content>
      <v-container>
        <nuxt />
      </v-container>
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

        <v-list-tile :to="signInBtn.url">
          <v-list-tile-action>
            <v-icon>{{ signInBtn.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ signInBtn.title }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile :to="signUpBtn.url">
          <v-list-tile-action>
            <v-icon>{{ signUpBtn.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ signUpBtn.title }}</v-list-tile-title>
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
        homeBtn: {title: 'Sentimony Records', icon: 'mdi-robot', url: '/'},
        releasesBtn: {title: 'Releases', icon: 'mdi-yin-yang', url: '/releases'},
        artistsBtn: {title: 'Artists', icon: 'mdi-headset', url: '/artists'},
        signInBtn: {title: 'Sign In', icon: 'mdi-key', url: '/user/signin'},
        signUpBtn: {title: 'Sign Up', icon: 'mdi-account-plus', url: '/user/signup'}
      }
    }
  }
</script>

<style>
</style>
