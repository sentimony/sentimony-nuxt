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
    </v-toolbar>

    <v-content>
      <v-container>
        <nuxt/>
      </v-container>
      <donate/>
    </v-content>
    <foot-one/>


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

      </v-list>
    </v-navigation-drawer>

  </v-app>
</template>

<script>
import Donate from '~/components/Donate'
import FootOne from '~/components/FootOne'

  export default {
    components: {
      Donate,
      FootOne
    },
    data () {
      return {
        sideNav: null,
        homeBtn: {title: 'Sentimony Records', icon: 'mdi-robot', url: '/'},
        releasesBtn: {title: 'Releases', icon: 'mdi-yin-yang', url: '/releases'},
        artistsBtn: {title: 'Artists', icon: 'mdi-headset', url: '/artists'}
      }
    },
    head: {
      link: [
        { rel: 'shortcut icon', href: 'https://firebasestorage.googleapis.com/v0/b/sentimony-db.appspot.com/o/favi%2Ffavicon-32-site.png?alt=media&token=a060a2ba-68f7-4b4e-b0e4-e04dd2cf7de3' }
      ]
    }
  }
</script>

<style>
</style>
