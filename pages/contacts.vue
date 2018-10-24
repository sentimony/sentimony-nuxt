<template>
  <div class="contacts">
    <h1 class="contacts__caption">Contacts</h1>
    <p class="contacts__title">{{ social.touch }}</p>
    <p><a href="mailto:sentimony@gmail.com?subject=Hello, Sentimony Records">sentimony@gmail.com</a></p>
    <p class="contacts__title">{{ social.follow }}</p>
    <p v-for="i in social.data" v-if="i.isVisibleContacts">
      <a class="contacts__link" :href="i.url" target="_blank" rel="noopener">
        <img class="contacts__icon" :src="'https://content.sentimony.com/assets/img/svg-icons/' + i.icon + '.svg'" :alt="i.title + ' Icon'">
        <span>{{ i.title }}</span>
      </a>
    </p>
  </div>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  async asyncData() {
    const { data } = await axios.get('social.json')
    return { social: data }
  },
  head: {
    title: 'Contacts',
    meta: [
      { name: 'description', content: 'Contacts of Sentimony Records' }
    ]
  }
}
</script>

<style lang="scss">
@import '../assets/scss/page';
// @import '../assets/scss/variables';

.contacts {
  @extend .page;

  &__link {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__icon {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }

//   &__title {
//     color: $accent-color;
//     font-weight: 700;
//     text-transform: uppercase;
//   }

//   nav {
//     a {
//       display: inline-block;
//       padding: 1em;
//     }
//   }
}
</style>
