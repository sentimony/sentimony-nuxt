<script setup lang="ts">
// defineProps<{
//   title?: string
//   category?: string
//   list?: any[]
// }>()

// const containerRef = ref(null)
// const slides = ref(Array.from({ length: 10 }))
// const swiper = useSwiper(containerRef, {
//   mousewheelControl: true,
//   mousewheelForceToAxis: true,
//   freeMode: true,
//   slidesPerView: 'auto',
//   speed: 350,
//   // slidesPerGroup: 4,
//   slideToClickedSlide: true,
//   centeredSlides: true,
//   navigation: true,
//   // spaceBetween: 0,
// })
// onMounted(() => {
//   console.log(swiper.instance)
// })
</script>

<template>
  <!-- <div class="h-[164px] md:h-[296px] overflow-hidden">

    <div v-if="title" class="text-[18px] md:text-[32px] my-[.5em]">{{ title }}</div>

    <ClientOnly>
      <swiper-container ref="containerRef">
        <swiper-slide
          v-for="(i, idx) in list"
          :key="idx"
          style="background-color: rgb(32, 233, 70); color: white; width: 200px !important;"
        >
          <NuxtLink :to="'/' + (category || '') + '/' + i.slug + '/'">
            <img
              class="w-[120px]"
              v-if="i.cover_th"
              :src="i.cover_th"
              :alt="i.title + ' Small Thumbnail'"
            />
          </NuxtLink>
        </swiper-slide>
      </swiper-container>
    </ClientOnly>

    <button @click="swiper.prev()">Prev</button>
    <button @click="swiper.next()">Next</button>

  </div> -->
</template>

<style lang="scss"></style>
