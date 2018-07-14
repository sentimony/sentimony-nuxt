<template>
  <v-alert
    error
    dismissible
    @input="onClose"
    :value="true"
    icon="mdi-alert"
  >
    {{ text }}
  </v-alert>
</template>

<script>
  export default {
    props: ['text'],
    methods: {
      onClose () {
        this.$emit('dismissed')
      }
    }
  }
</script>

<style>
</style>
