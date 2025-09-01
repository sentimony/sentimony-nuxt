<script setup lang="ts">
defineProps<{
  title?: string;
  route?: string;
  list?: any[];
}>()
</script>

<template>
  <div class="h-[296px] overflow-hidden">
    
    <div v-if="title" class="text-[18px] md:text-[32px] my-[.5em]">{{ title }}</div>

    <div class="flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]">
      <Item 
        v-for="i in list"
        :key="i.slug"
        :route="route"
        :i="i"
      />
    </div>

  </div>
</template>

<style lang="scss"></style>
