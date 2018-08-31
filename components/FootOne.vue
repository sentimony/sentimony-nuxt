<template>
  <div class="sen-footer text-xs-center" v-html="footerOne"/>
</template>

<script>
  export default {
    data: () => ({
      footerOne: '2006 - 2018 © Sentimony Records<br>All Rights Reserved'
    })
  }
</script>

<style lang="stylus">
  .sen-footer
    color #fff
    background-color #000
</style>
