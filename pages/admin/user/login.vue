<template>
  <v-layout>
    <v-flex text-xs-center xs12 sm6 offset-sm3>
     <v-card>
       <v-card-title class="headline">Login</v-card-title>
       <v-card-text>
         <login-google/>
       </v-card-text>
     </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
  import LoginGoogle from '~/components/LoginGoogle'

  export default {
    layout: 'admin',
    components: {
      LoginGoogle
    },
    head: {
      title: 'Login',
      meta: [
        { name: 'description', content: '' },
        { property: 'og:image', content: '' }
      ]
    }
  }
</script>

<style>
</style>
