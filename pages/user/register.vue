<template>
  <login-form/>
</template>

<script>
  import LoginForm from '~/components/LoginForm'

  export default {
    layout: 'admin',
    components: {
      LoginForm
    },
    head: {
      title: 'Registeration',
      meta: [
        { name: 'description', content: '' },
        { property: 'og:image', content: 'https://content.sentimony.com/assets/img/og-images/sentimony/home.jpg' }
      ]
    }
  }
</script>

<style>
</style>
