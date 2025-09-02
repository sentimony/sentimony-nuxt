<script setup lang="ts">
defineProps<{
  title?: string
  category?: string
  list?: any[]
}>()
</script>

<template>
  <div class="h-[164px] md:h-[296px] overflow-y-hidden overflow-x-auto">

    <div v-if="title" class="text-[18px] md:text-[32px] my-[.5em]">{{ title }}</div>

    <div class="flex justify-start w-full pb-[30px] md:pb-[60px]">
      <Item 
        v-for="i in list"
        :key="i.slug"
        :category="category"
        :i="i"
      />
    </div>

  </div>
</template>

<style lang="scss"></style>
