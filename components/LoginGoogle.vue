<template>
  <v-btn
    class="error"
    @click.native="googleSignUp"
  >
    <v-icon left>mdi-google</v-icon>
    Google Sign In
  </v-btn>
</template>

<script>
  export default {
    data () {
      return {
        formEmail: '',
        formPassword: ''
      }
    },
    methods: {
      googleSignUp () {
        this.$store.dispatch('signInWithGoogle').then(() => {
          console.log('inside then statement on login');
        }).catch((e) => {
          console.log(e.message);
        })
      }
    }
  }
</script>

<style>
</style>
