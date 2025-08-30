<template>
  <div style="display: flex; align-items: center; margin-bottom: 12px;">
    
    <router-link 
      v-if="i.cover_th"
      v-ripple
      :to="'../../' + category + '/' + i.slug + '/'"
      style="max-width:24px;margin-right:8px;"
    >
      <img style="display: block;" :src="i.cover_th" :alt="i.title + ' thumbnail'" />
    </router-link>

    <router-link 
      v-if="i.photo_th"
      v-ripple
      :to="'../../' + category + '/' + i.slug + '/'"
      style="max-width:24px;margin-right:8px;"
    >
      <img style="display: block;" :src="i.photo_th" :alt="i.title + ' thumbnail'" />
    </router-link>

    <div>
      <span>{{ i.title }}</span>
      <small v-if="i.date">({{ i.date | year }})</small>

    <router-link 
      v-ripple
      :to="'../../' + category + '/' + i.slug + '/'"
    >
      <small>Read More</small>
    </router-link>
    </div>
    
  </div>
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
