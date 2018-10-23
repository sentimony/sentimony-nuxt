<template>
  <!-- <v-container> -->
    <v-layout>
      <v-flex xs4>
        <v-navigation-drawer>
          <v-list>

            <!-- <v-list-tile to="/admin" exact>
              <v-list-tile-action>
                <v-icon>mdi-view-dashboard</v-icon>
              </v-list-tile-action>
              <v-list-tile-title>Dashboard</v-list-tile-title>
            </v-list-tile>

            <v-list-tile to="/admin/pages">
              <v-list-tile-action>
                <v-icon>mdi-book-open-page-variant</v-icon>
              </v-list-tile-action>
              <v-list-tile-title>Pages</v-list-tile-title>
            </v-list-tile> -->

            <v-list-tile v-for="i in menu" :key="i.url" :to="i.url" exact>
              <v-list-tile-action>
                <v-icon>{{ i.icon }}</v-icon>
              </v-list-tile-action>
              <v-list-tile-title>{{ i.title }}</v-list-tile-title>
            </v-list-tile>

          </v-list>
        </v-navigation-drawer>
      </v-flex>
      <v-flex xs8>
        <!-- <v-card> -->
          <nuxt-child :key="$router.fullPath"/>
        <!-- </v-card> -->
      </v-flex>
    </v-layout>
  <!-- </v-container> -->
</template>

<script>
  export default {
    layout: 'admin',
    data () {
      return {
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
          icon: 'mdi-yin-yang',
          url: '/admin/releases'
        }, {
          title: 'Artists',
          icon: 'mdi-headset',
          url: '/admin/artists'
        }, {
          title: 'Donate',
          icon: 'mdi-cash',
          url: '/admin/donate'
        }]
      }
    },
    head: {
      title: 'Admin',
      meta: [
        { name: 'description', content: '' },
        { property: 'og:image', content: '' }
      ]
    }
  }
</script>

<style>
</style>
