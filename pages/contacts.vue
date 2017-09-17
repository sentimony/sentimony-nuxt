<template>
  <div class="contacts">
    <h1 class='footer__title'>Contacts</h1>
    <p><a href='mailto:sentimony@gmail.com?subject=Hello, Sentimony Records'>sentimony@gmail.com</a></p>
    <div class='footer__title'>Let's be in touch:</div>
    <nav>
      <a v-for="(item, key) in contacts" :href="item.url" target="_blank">{{ item.title }}</a>
    </nav>
  </div>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  head: {
    title: 'Contacts',
    meta: [
      { name: 'description', content: 'Contacts page description' }
    ]
  },
  async asyncData() {
    const { data } = await axios.get('contacts.json')
    return {
      contacts: data
    }
  }
}
</script>

<style lang="scss">
$text-color: #ccc;
$accent-color: lighten($text-color, 10%);

.contacts {

  &__title {
    color: $accent-color;
    font-weight: 700;
    text-transform: uppercase;
  }

  nav {
    a {
      display: inline-block;
      padding: 1em;
    }
  }
}
</style>
