<template>
  <span>
    <span v-if="i.cover_th" style="vertical-align:top;">
      <img style="width:20px;margin-right:6px;" :src="i.cover_th" :alt="i.title" />
    </span>
    <span>{{ i.title }}</span>
    <span>({{ i.date | year }})</span>
    <router-link 
      v-ripple
      :to="'../../' + category + '/' + i.slug + '/'"
      v-html="'Read More'"
    />
  </span>
</template>

<script>
import moment from 'moment'

export default {
  props: {
    i: Object,
    category: String
  },
  filters: {
    year: function(date) {
      if (date) {
        return moment(String(date)).format('YYYY')
      }
    }
  }
}
</script>

<style lang="scss"></style>
