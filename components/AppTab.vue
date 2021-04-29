<template>
  <div class="app-tab" v-show="isActive">
    <slot></slot>
  </div>
</template>

<script>
  export default {
    props: {
      title: {
        type: String,
        default: 'Tab'
      }
    },
    data () {
      return {
        isActive: true
      }
    }
  }
</script>

<style lang="css">
  .app-tab {
    padding: 12px;
    background-color: rgba(204, 204, 204, 0.4);
    border-radius: 0 9px 9px 9px;
  }
</style>
