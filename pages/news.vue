<template>
  <div class="page">
    <h1>News</h1>

    <p
      v-for="(i, index) in sortByDate"
      :key="index"
      v-if="!i.coming_soon"
    >
      {{ i.date | formatDate }}
      @
      {{ i.title }}
      |
      <router-link v-ripple :to="'../' + `${i.location ? 'event' : 'release'}` + '/' + i.slug">Reed More</router-link>
    </p>

    <!-- <ul class="timeline timeline-centered">
      <li class="timeline-item"
        v-for="(i, index) in sortByDate"
        :key="index"
        :class="i.date.includes('-12-31T00:00:00.000Z') ? 'period' : ''"
      >
        <div class="timeline-info" v-if="!i.date.includes('-12-31T00:00:00.000Z')">
          <span>{{ i.date | formatDate }}</span>
        </div>
        <div class="timeline-marker"></div>
        <div class="timeline-content">
          <h3 class="timeline-title" v-if="i.date.includes('-12-31T00:00:00.000Z')">{{ i.date | year }}</h3>
          <h3 class="timeline-title" v-if="i.title">{{ i.title }}</h3>
          <p v-if="i.title">Nullam vel sem. Nullam vel sem. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Donec orci lectus, aliquam ut, faucibus non, euismod id, nulla. Donec vitae sapien ut libero venenatis faucibus. ullam dictum felis eu pede mollis pretium. Pellentesque ut neque.</p>
          <router-link class="news__btn"
            v-ripple v-if="i.url"
            :to="i.url"
          >Reed More</router-link>
        </div>
      </li>
    </ul> -->

  </div>
</template>

<script>
  import axios from '~/plugins/axios'
  import sortBy from 'lodash/sortBy'
  import moment from 'moment'

  export default {
    async asyncData() {
      const [releasesRes, eventsRes] = await Promise.all([
        axios.get('releases.json'),
        axios.get('events.json')
      ]);
      const news = Object.assign(releasesRes.data, eventsRes.data)
      return { news }
    },
    computed: {
      sortByDate () {
        return sortBy(this.news, 'date').reverse()
      }
    },
    filters: {
      formatDate: function (date) {
        if (date) {
          return moment(String(date)).format('DD MMM YYYY');
        }
      },
      // year: function (date) {
      //   if (date) {
      //     return moment(String(date)).format('YYYY');
      //   }
      // }
    },
    head: {
      title: 'News',
      meta: [
        { name: 'description', content: 'News of Sentimony Records' },
        { property: 'og:image', content: 'https://content.sentimony.com/assets/img/og-images/sentimony/og-default.jpg' }
      ]
    }
  }
</script>

<style lang="scss">
  // $primary-color: #FF6B6B;
  // $primary-color-hover: scale-color($primary-color, $lightness: 32%);
  //
  // h3 {
  //   margin-top: 0;
  // }
  //
  // /*==================================
  //     TIMELINE
  // ==================================*/
  //
  //     /*-- GENERAL STYLES
  //     ------------------------------*/
  //     .timeline {
  //         line-height: 1.4em;
  //         list-style: none;
  //         margin: 0;
  //         padding: 0;
  //         width: 100%;
  //         // h1, h2, h3, h4, h5, h6 {
  //         //     line-height: inherit;
  //         // }
  //     }
  //
  //     /*----- TIMELINE ITEM -----*/
  //
  //     .timeline-item {
  //         padding-left: 40px;
  //         position: relative;
  //         &:last-child {
  //             padding-bottom: 0;
  //         }
  //     }
  //
  //     /*----- TIMELINE INFO -----*/
  //
  //     .timeline-info {
  //         font-size: 12px;
  //         font-weight: 700;
  //         letter-spacing: 3px;
  //         margin: 0 0 .5em 0;
  //         text-transform: uppercase;
  //         white-space: nowrap;
  //         box-sizing: border-box;
  //     }
  //     /*----- TIMELINE MARKER -----*/
  //
  //     .timeline-marker {
  //         position: absolute;
  //         top: 0; bottom: 0; left: 0;
  //         width: 15px;
  //         &:before {
  //             box-sizing: border-box;
  //             background: $primary-color;
  //             border: 3px solid transparent;
  //             border-radius: 100%;
  //             content: "";
  //             display: block;
  //             height: 15px;
  //             position: absolute;
  //             top: 4px; left: 0;
  //             width: 15px;
  //             transition: background 0.3s ease-in-out,
  //                     border 0.3s ease-in-out;
  //         }
  //         &:after {
  //             content: "";
  //             width: 3px;
  //             background: #CCD5DB;
  //             display: block;
  //             position: absolute;
  //             top: 24px; bottom: 0; left: 6px;
  //         }
  //         .timeline-item:last-child &:after {
  //             content: none;
  //         }
  //     }
  //     .timeline-item:not(.period):hover .timeline-marker:before {
  //         background: transparent;
  //         border: 3px solid $primary-color;
  //     }
  //
  //     /*----- TIMELINE CONTENT -----*/
  //
  //     .timeline-content {
  //         padding-bottom: 40px;
  //         box-sizing: border-box;
  //         p:last-child {
  //             margin-bottom: 0;
  //         }
  //     }
  //
  //     /*----- TIMELINE PERIOD -----*/
  //
  //     .period {
  //         padding: 0;
  //         .timeline-info {
  //             display: none;
  //         }
  //         .timeline-marker {
  //             &:before {
  //                 background: transparent;
  //                 content: "";
  //                 width: 15px;
  //                 height: auto;
  //                 border: none;
  //                 border-radius: 0;
  //                 top: 0;
  //                 bottom: 30px;
  //                 position: absolute;
  //                 border-top: 3px solid #CCD5DB;
  //                 border-bottom: 3px solid #CCD5DB;
  //             }
  //             &:after {
  //                 content: "";
  //                 height: 32px;
  //                 top: auto;
  //             }
  //         }
  //         .timeline-content {
  //             padding: 40px 0 70px;
  //         }
  //         .timeline-title {
  //             margin: 0;
  //         }
  //     }
  //
  //     /*----------------------------------------------
  //         MOD: TIMELINE SPLIT
  //     ----------------------------------------------*/
  //
  //         .timeline-split {
  //             @media (min-width: 768px) {
  //                 .timeline {
  //                     display: table;
  //                 }
  //                 .timeline-item {
  //                     display: table-row;
  //                     padding: 0;
  //                 }
  //                 .timeline-info,
  //                 .timeline-marker,
  //                 .timeline-content,
  //                 .period .timeline-info {
  //                     display: table-cell;
  //                     vertical-align: top;
  //                 }
  //                 .timeline-marker {
  //                     position: relative;
  //                 }
  //                 .timeline-content {
  //                     padding-left: 30px;
  //                 }
  //                 .timeline-info {
  //                     padding-right: 30px;
  //                 }
  //                 .period .timeline-title {
  //                     position: relative;
  //                     left: -45px;
  //                 }
  //             }
  //         }
  //
  //     /*----------------------------------------------
  //         MOD: TIMELINE CENTERED
  //     ----------------------------------------------*/
  //
  //         .timeline-centered {
  //             @extend .timeline-split;
  //             text-align: left;
  //             @media (min-width: 992px) {
  //                 &,
  //                 .timeline-item,
  //                 .timeline-info,
  //                 .timeline-marker,
  //                 .timeline-content {
  //                     display: block;
  //                     margin: 0;
  //                     padding: 0;
  //                 }
  //                 .timeline-item {
  //                     padding-bottom: 40px;
  //                     overflow: hidden;
  //                 }
  //                 .timeline-marker {
  //                     position: absolute;
  //                     left: 50%;
  //                     margin-left: -7.5px;
  //                 }
  //                 .timeline-info,
  //                 .timeline-content {
  //                     width: 50%;
  //                 }
  //                 > .timeline-item:nth-child(odd) .timeline-info {
  //                     float: left;
  //                     text-align: right;
  //                     padding-right: 30px;
  //                 }
  //                 > .timeline-item:nth-child(odd) .timeline-content {
  //                     float: right;
  //                     text-align: left;
  //                     padding-left: 30px;
  //                 }
  //                 > .timeline-item:nth-child(even) .timeline-info {
  //                     float: right;
  //                     text-align: left;
  //                     padding-left: 30px;
  //                 }
  //                 > .timeline-item:nth-child(even) .timeline-content {
  //                     float: left;
  //                     text-align: right;
  //                     padding-right: 30px;
  //                 }
  //                 > .timeline-item.period .timeline-content {
  //                     float: none;
  //                     padding: 0;
  //                     width: 100%;
  //                     text-align: center;
  //                 }
  //                 .timeline-item.period {
  //                     padding: 50px 0 90px;
  //                 }
  //                 .period .timeline-marker:after {
  //                     height: 30px;
  //                     bottom: 0;
  //                     top: auto;
  //                 }
  //                 .period .timeline-title {
  //                     left: auto;
  //                 }
  //             }
  //         }
  //
  //     /*----------------------------------------------
  //         MOD: MARKER OUTLINE
  //     ----------------------------------------------*/
  //
  //         .marker-outline {
  //             .timeline-marker {
  //                 &:before {
  //                     background: transparent;
  //                     border-color: $primary-color;
  //                 }
  //             }
  //             .timeline-item:hover .timeline-marker:before {
  //                 background: $primary-color;
  //             }
  //         }
</style>
