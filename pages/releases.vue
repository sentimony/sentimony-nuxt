<template>
  <div class="releases">
    <h1>Releases</h1>
    <nav class="releases__list">
      <div class="releases__item" v-for="release in sortedReleases" v-if='!release.date'>
        <nuxt-link class="releases__link" :to="{ path: `/release/${release.slug}`}">
          <div class="releases__thumb" v-if='release.cover'>
            <img class="releases__cover" :src="'https://content.sentimony.com/assets/img/releases/small/' + release.cat_no.substr(0,8) + '/' + release.slug + '.jpg'" :alt="release.title">
          </div>
          <div class="releases__text">
            <div class="releases__title">{{ release.title }}</div>
            <div class="releases__date">Coming Soon</div>
          </div>
        </nuxt-link>
      </div>
      <div class="releases__item" v-for="release in sortedReleases" v-if='release.date'>
        <nuxt-link class="releases__link" :to="{ path: `/release/${release.slug}`}">
          <div class="releases__thumb" v-if='release.cover'>
            <img class="releases__cover" :src="'https://content.sentimony.com/assets/img/releases/small/' + release.cat_no.substr(0,8) + '/' + release.slug + '.jpg'" :alt="release.title">
          </div>
          <div class="releases__text">
            <div class="releases__title">{{ release.title }}</div>
            <div class="releases__date" v-if='release.date'>{{ release.date | year }}</div>
          </div>
        </nuxt-link>
      </div>
    </nav>
  </div>
</template>

<script>
import axios from '~/plugins/axios'
import sortBy from 'lodash/sortBy'

export default {
  async asyncData() {
    const { data } = await axios.get('releases.json')
    return { releases: data }
  },
  computed: {
    sortedReleases () {
      return sortBy(this.releases, 'date').reverse()
    }
  },
  filters: {
    year (date) {
      return date.split('-')[0]
    }
  },
  head: {
    title: 'Releases',
    meta: [
      { name: 'description', content: 'Releases of Sentimony Records' }
    ]
  }
}
</script>

<style lang="scss">
@import '../node_modules/coriolan-ui/tools/variables';
@import '../node_modules/coriolan-ui/mixins/media';

.releases {
  // background-color: rgba(#000,.05);
  margin: 0 auto;
  max-width: 444px;

  &__list {
    display: flex;
    flex-wrap: wrap;
    // justify-content: flex-start;
    // align-items: center;
  }

  &__item {
    position: relative;
    background-color: rgba(#fff,.05);
    // flex-basis: (100% / 2);
    flex-basis: (100% / 1);

    // @include media(M) {
    //   flex-basis: (100% / 3);
    // }

    // @include media(L) {
    //   flex-basis: (100% / 4);
    // }

    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background-image: repeating-linear-gradient(135deg, rgba(#fff,.0), rgba(#fff,.0) 4px, rgba(#fff,.1) 4px, rgba(#fff,.1) 8px);
      opacity: 0;
      transition: opacity .2s ease-in-out;
    }

    &:hover:before {
      opacity: 1;
    }
  }

  &__link {
    display: block;
    padding: .8em;
    position: relative;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
    }
  }

  &__thumb {
    // flex-basis: 50px;
    margin-right: .8em;
    position: relative;
  }

  &__cover {
    // opacity: .6;
    display: block;
  }

  &__text {
    flex-basis: 100%;
    text-align: left;
    position: relative;
  }

  &__title {
    font-size: .8em;
  }

  &__date {
    font-size: .6em;
  }
}
</style>
