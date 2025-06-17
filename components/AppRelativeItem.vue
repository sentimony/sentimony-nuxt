<template>
  <span>
    <span v-if="i.cover_xl">
      <img style="width:11px;height:auto;"
        :src="i.cover_xl"
        :alt="i.title"
      >
      |
    </span>
    {{ i.title }}
    |
    {{ i.date | year }}
    |
    <router-link v-ripple :to="'../../' + category + '/' + i.slug + '/'">Read More</router-link>
  </span>
</template>

<script>
  import moment from 'moment'

  export default {
    props: {
      'i': Object, 
      'category': String,
    },
    filters: {
      year: function (date) {
        if (date) {
          return moment(String(date)).format('YYYY');
        }
      }
    },
  }
</script>

<style lang="scss">
</style>
