<script setup lang="ts">
const heroTitle = 'Sentimony<br>Records'
const heroDescription = 'Psychedelic Music Label'
</script>

<template>
  <div
    class="font-Julius relative leading-[1.4] text-white bg-gradient-to-b from-transparent to-black/50
    py-[7.5em]
    sm:py-[8.5em]
    md:py-[9.5em]
    lg:py-[10.5em]
    xl:py-[11.5em]"
  >
    <div class="max-w-[777px] px-2 box-border mx-auto">
      <div
        class="uppercase mb-[0.2em]
        text-[40px] tracking-[2px]
        sm:text-[55px] sm:tracking-[5px]
        md:text-[70px] md:tracking-[8px]
        lg:text-[85px] lg:tracking-[11px]
        xl:text-[100px] xl:tracking-[14px]"
        v-html="heroTitle"
      />
      <div
        class="text-[12px] tracking-[4px]
        sm:text-[14px] sm:tracking-[8px]
        md:text-[16px] md:tracking-[12px]
        lg:text-[18px] lg:tracking-[16px]
        xl:text-[20px] xl:tracking-[20px]"
        v-html="heroDescription"
      />
    </div>
  </div>
</template>

<style lang="scss"></style>
