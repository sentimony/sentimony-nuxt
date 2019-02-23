<template>
  <div class="contacts">
    <h1 class="contacts__caption">Contacts</h1>
    <p class="contacts__title">{{ touch }}</p>
    <p><a :href="mailtoUrl">{{ email }}</a></p>
    <p class="contacts__title">{{ follow }}</p>
    <p v-if="loading">Loading...</p>
    <div v-else>
      <p v-for="i in socialStore" :key="i.title" v-if="i.isVisibleContacts">
        <a class="contacts__link"
          :href="i.url"
          target="_blank"
          rel="noopener"
        >
          <img class="contacts__icon" :src="'https://content.sentimony.com/assets/img/svg-icons/' + i.icon + '.svg'" :alt="i.title + ' Icon'">
          <span>{{ i.title }}</span>
        </a>
      </p>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        touch: "Let's be in touch:",
        mailtoUrl: 'mailto:sentimony@gmail.com?subject=Hello, Sentimony Records',
        email: 'sentimony@gmail.com',
        follow: 'Follow Us:'
      }
    },
    computed: {
      loading () {
        return this.$store.getters.loading
      },
      socialStore () {
        return this.$store.getters.loadedSocial
      }
    },
    head: {
      title: 'Contacts',
      meta: [
        { name: 'description', content: 'Contacts of Sentimony Records' },
        { property: 'og:image', content: 'https://firebasestorage.googleapis.com/v0/b/sentimony-db.appspot.com/o/og%2Fog-default.jpg?alt=media&token=85a8d7a3-ab49-4cff-9df9-fd3e2478e780' }
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
