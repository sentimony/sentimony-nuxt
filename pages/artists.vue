<template>
  <div class="artists">
    <h1>Artists</h1>
    <div class="artists__list">
      <div v-for="i in artists" class="artists__item">
        <p v-if="i.slug">
          <router-link :to="'/artist/' + i.slug + '/'" class="artists__link">
            <img class="artists__photo"
              :src="'https://content.sentimony.com/assets/img/artists/small/' + i.slug + '.jpg'"
              :srcset="'https://content.sentimony.com/assets/img/artists/small/' + i.slug + '.jpg 1x, https://content.sentimony.com/assets/img/artists/small-retina/' + i.slug + '.jpg 2x'"
              :alt="i.title + ' Small Thumbnail'"
            >
          </router-link>
        </p>
        <p class="artists__title">
          <router-link :to="'/artist/' + i.slug + '/'">{{ i.title }}</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  async asyncData() {
    const { data } = await axios.get('artists.json')
    return { artists: data }
  },
  head: {
    title: 'Artists',
    meta: [
      { name: 'description', content: 'Artists of Sentimony Records' }
    ]
  }
}
</script>

<style lang="scss">
@import '../assets/scss/variables';

.artists {
  max-width: 1278px;
  margin: 0 auto;

  &__list {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }

  &__item,
  &__link {
    width: 120px;
  }

  &__photo {
    display: block;
    margin: 0 auto;
    width: 100%;
    height: auto;
    box-shadow: $shadow;
    border-radius: 8px;
  }

  &__title {
    min-height: 44px;
  }
}
</style>
