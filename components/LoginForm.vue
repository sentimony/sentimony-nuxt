<template>
  <v-layout>
    <v-flex text-xs-center xs12 sm6 offset-sm3>
     <v-card>
       <v-card-title class="headline">Sign In</v-card-title>
       <v-card-text>
         <v-btn class="signIn mb-2" primary @click.native="googleSignUp">Google Sign In</v-btn>
       </v-card-text>
     </v-card>
    </v-flex>
  </v-layout>

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
    emailLogin () {
      this.$store.dispatch('signInWithEmail', {
        email: this.formEmail,
        password: this.formPassword
      }).then(() => {
        this.formEmail = ''
        this.formPassword = ''

      }).catch((e) => {
        console.log(e.message);
      })
    },
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
