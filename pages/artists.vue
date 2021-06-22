<template>
  <div class="page">

    <h1>Artists</h1>

    <h2>Producers & Musicians</h2>

    <div class="list">
      <div class="item"
        v-for="(i, index) in sortByCategoryId"
        :key="index"
        v-if="i.visible && i.category == 'musician'"
      >
        <router-link v-ripple :to="'/artist/' + i.slug + '/'" class="item__link">
          <div class="item__wrapper">
            <div class="item__cover">
              <img v-if="i.photo_th" class="item__img"
                :src="i.photo_th"
                :alt="i.title + ' Small Thumbnail'"
              >
              <img v-if="!i.photo_xl && i.photo" class="item__img"
                :src="'https://content.sentimony.com/assets/img/artists/small/' + i.slug + '.jpg'"
                :srcset="'https://content.sentimony.com/assets/img/artists/small/' + i.slug + '.jpg 1x, https://content.sentimony.com/assets/img/artists/small-retina/' + i.slug + '.jpg 2x'"
                :alt="i.title + ' Small Thumbnail'"
              >
              <div v-if="!i.photo_th && !i.photo"
                class="item__soon" v-html="texts.comingPhoto"
              />
            </div>
          </div>
          <div class="item__title">{{ i.title }}</div>
        </router-link>
      </div>
    </div>

    <h2>Djs</h2>

    <div class="list">
      <div class="item"
        v-for="(i, index) in sortByCategoryId"
        :key="index"
        v-if="i.visible && i.category == 'dj'"
      >
        <router-link v-ripple :to="'/artist/' + i.slug + '/'" class="item__link">
          <div class="item__wrapper">
            <div class="item__cover">
              <img v-if="i.photo_th" class="item__img"
                :src="i.photo_th"
                :alt="i.title + ' Small Thumbnail'"
              >
              <!-- <img v-if="i.photo_xl" class="item__img"
                :src="i.photo_xl"
                :alt="i.title + ' Small Thumbnail'"
              > -->
              <!-- <img v-if="!i.photo_xl && i.photo" class="item__img"
                :src="'https://content.sentimony.com/assets/img/artists/small/' + i.slug + '.jpg'"
                :srcset="'https://content.sentimony.com/assets/img/artists/small/' + i.slug + '.jpg 1x, https://content.sentimony.com/assets/img/artists/small-retina/' + i.slug + '.jpg 2x'"
                :alt="i.title + ' Small Thumbnail'"
              > -->
              <div v-if="!i.photo_th"
                class="item__soon" v-html="texts.comingPhoto"
              />
            </div>
          </div>
          <div class="item__title">{{ i.title }}</div>
        </router-link>
      </div>
    </div>

    <h2>Visual Artists & Designers</h2>

    <div class="list">
      <div class="item"
        v-for="(i, index) in sortByCategoryId"
        :key="index"
        v-if="i.visible && i.category == 'designer'"
      >
        <router-link v-ripple :to="'/artist/' + i.slug + '/'" class="item__link">
          <div class="item__wrapper">
            <div class="item__cover">
              <img v-if="i.photo_th" class="item__img"
                :src="i.photo_th"
                :alt="i.title + ' Small Thumbnail'"
              >
              <!-- <img v-if="i.photo_xl" class="item__img"
                :src="i.photo_xl"
                :alt="i.title + ' Small Thumbnail'"
              > -->
              <!-- <img v-if="!i.photo_xl && i.photo" class="item__img"
                :src="'https://content.sentimony.com/assets/img/artists/small/' + i.slug + '.jpg'"
                :srcset="'https://content.sentimony.com/assets/img/artists/small/' + i.slug + '.jpg 1x, https://content.sentimony.com/assets/img/artists/small-retina/' + i.slug + '.jpg 2x'"
                :alt="i.title + ' Small Thumbnail'"
              > -->
              <div v-if="!i.photo_th"
                class="item__soon" v-html="texts.comingPhoto"
              />
            </div>
          </div>
          <div class="item__title">{{ i.title }}</div>
        </router-link>
      </div>
    </div>

  </div>
</template>

<script>
  import axios from '~/plugins/axios'
  import sortBy from 'lodash/sortBy'
  import AppContent from '~/plugins/app-content'

  export default {
    data () {
      return {
        texts: AppContent.texts,
      }
    },
    async asyncData() {
      const { data } = await axios.get('artists.json')
      return { artists: data }
    },
    computed: {
      sortByCategoryId () {
        return sortBy(this.artists, 'category_id')
      }
    },
    head: {
      title: 'Artists',
      meta: [
        { name: 'description', content: 'Artists of Sentimony Records' },
        { property: 'og:image', content: 'https://content.sentimony.com/assets/img/og-images/sentimony/og-default.jpg' }
      ]
    }
  }
</script>

<style lang="scss">
</style>
