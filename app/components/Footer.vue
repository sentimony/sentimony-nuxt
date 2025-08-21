<script setup lang="ts"></script>

<template>
  <div class="relative z-100 bg-black text-white/50 text-xs leading-[1.4] md:leading-[1.5] px-1 py-[100px]">
    <div class="container flex flex-col items-center">
      
      <div>MenuMain</div>
      <br>

      <div>MenuSocial</div>
      <br>

      <div class="mb-[24px]">
        <div>2006 - {{ new Date().getFullYear() }} © Sentimony Records</div>
        <div>All Rights Reserved</div>
        <div>
          <img 
            class="w-[30px] block mx-auto mt-[4px]" 
            src="https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.2.svg?01" 
            alt="Sentimony Records Logo SVG"
          />
        </div>
      </div>

      <div class="text-[10px] mb-[20px]">
        <div>Design by <a class="text-white" href="https://www.facebook.com/apivniuk" target="_blank" rel="noopener">Anton Pivniuk</a></div>
        <div>Development by <a class="text-white" href="https://github.com/sentimony/sentimony-nuxt" target="_blank" rel="noopener">Ihor Orlovskyi</a></div>
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped></style>
