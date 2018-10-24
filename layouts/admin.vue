<template>
  <v-app>

    <v-navigation-drawer
      app
      fixed
    >
      <v-list>
        <v-list-tile v-for="i in menu" :key="i.url" :to="i.url" exact>
          <v-list-tile-action>
            <v-icon>{{ i.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-title>{{ i.title }}</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar
      app
      dense
    >

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
          icon: 'mdi-yin-yang',
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
        },
        menu: [{
          title: 'Dashboard',
          icon: 'mdi-view-dashboard',
          url: '/admin'
        }, {
          title: 'Pages',
          icon: 'mdi-book-open-page-variant',
          url: '/admin/pages'
        }, {
          title: 'Releases',
          icon: 'mdi-headset',
          url: '/admin/releases'
        }, {
          title: 'Artists',
          icon: 'mdi-alien',
          url: '/admin/artists'
        }, {
          title: 'News',
          icon: 'mdi-newspaper',
          url: '/admin/news'
        }, {
          title: 'Events',
          icon: 'mdi-calendar',
          url: '/admin/events'
        }, {
          title: 'Friends',
          icon: 'mdi-human-greeting',
          url: '/admin/friends'
        }, {
          title: 'Contacts',
          icon: 'mdi-at',
          url: '/admin/contacts'
        }, {
          title: 'Donate',
          icon: 'mdi-cash-multiple',
          url: '/admin/donate'
        }]
      }
    },
    computed: {
      userIsAuthenticated () {
        return this.$store.getters.userIsAuthenticated
      }
    },
    head: {
      title: 'Admin',
      link: [
        { rel: 'shortcut icon', href: 'https://firebasestorage.googleapis.com/v0/b/sentimony-db.appspot.com/o/favi%2Ffavicon-32-admin.png?alt=media&token=56c839db-f0ee-424f-ab36-5445d4488281' }
      ]
    }
  }
</script>

<style>
</style>
