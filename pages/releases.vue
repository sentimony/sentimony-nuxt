<template>
  <div class="releases">
    <h1>Releases</h1>
    <nav class="releases__list">
      <div class="releases__item" v-for="release in sortedReleases" v-if='!release.date'>
        <nuxt-link class="releases__link" :to="{ path: `/release/${release.slug}`}">
          <span class="releases__title">{{ release.title }}</span>
          <span class="releases__date">Coming Soon</span>
        </nuxt-link>
      </div>
      <div class="releases__item" v-for="release in sortedReleases" v-if='release.date'>
        <nuxt-link class="releases__link" :to="{ path: `/release/${release.slug}`}">
          <span class="releases__title">{{ release.title }}</span>
          <span class="releases__date" v-if='release.date'>{{ release.date | year }}</span>
        </nuxt-link>
      </div>
    </nav>
  </div>
</template>

<style lang="scss">
@import '../node_modules/coriolan-ui/tools/variables';
@import '../node_modules/coriolan-ui/mixins/media';

.releases {
  // background-color: rgba(#000,.05);
  margin: 0 auto;
  max-width: 999px;

  &__list {
    display: flex;
    flex-wrap: wrap;
    // justify-content: flex-start;
    // align-items: center;
  }

  &__item {
    background-color: rgba(#fff,.05);
    flex-basis: (100% / 2);
    position: relative;

    @include media(M) {
      flex-basis: (100% / 3);
    }

    @include media(L) {
      flex-basis: (100% / 4);
    }

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
    padding: 2em .8em;
    position: relative;

    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
    }
  }

  &__title {
    display: block;
  }

  &__date {
    display: block;
    // text-align: right;
    font-size: .6em;
  }
}
</style>

<script>
import axios from '~plugins/axios'
import sortBy from 'lodash/sortBy'

export default {
  head: {
    title: 'Releases',
    meta: [
      { name: 'description', content: 'Releases page description' }
    ]
  },
  async data() {
    const { data } = await axios.get('releases.json')
    return {
      releases: data
    }
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
  }
}
</script>
