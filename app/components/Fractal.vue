<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const route = useRoute()
const { isDark } = useTheme()
const isAnimating = ref(false)

const PETAL_COUNT = 24
const ROTATION_ANGLE = 360 / PETAL_COUNT
const ANIMATION_DURATION = 6000

const petalRotations = computed(() => {
  return Array.from({ length: PETAL_COUNT }, (_, i) => ({
    id: i,
    rotation: (i + 1) * ROTATION_ANGLE
  }))
})

const petalGradient = computed(() =>
  isDark.value
    ? 'radial-gradient(ellipse at 50% 0, rgba(255,255,255,0.05) 0%, rgba(138,2,2,0) 50%, rgba(0,0,0,0.33) 100%)'
    : 'radial-gradient(ellipse at 50% 0, rgba(0,0,0,0.05) 0%, rgba(138,2,2,0) 50%, rgba(255,255,255,0.33) 100%)'
)

const startAnimation = () => {
  isAnimating.value = true
  setTimeout(() => {
    isAnimating.value = false
  }, ANIMATION_DURATION)
}

onMounted(() => {
  startAnimation()
})

watch(() => route.path, () => {
  startAnimation()
})

</script>

<template>
  <div 
    class="fractal-orbit fixed inset-0"
    :class="{ 'animate-[spin2_6.0s_ease-in-out]': isAnimating }"
  >
    <div
      v-for="petal in petalRotations"
      :key="petal.id"
      class="absolute top-1/2 left-1/2 origin-[0] -translate-x-1/2 -translate-y-1/2"
      :style="{
        transform: `rotate(${petal.rotation}deg)`,
      }"
    >
      <div
        class="fractal-petal absolute w-32 h-64 rounded-full transition-all duration-[1.2s] ease-in-out"
        :class="{ '!w-64 !h-32 !duration-[4.0s] !delay-[0.0s] animate-[spin2rev_6.0s_ease-in-out]': isAnimating }"
        :style="{ background: petalGradient }"
      />
    </div>
  </div>
</template>

<style>
@media (prefers-reduced-motion: reduce) {
  .fractal-orbit,
  .fractal-petal {
    animation: none !important;
    transition: none !important;
  }
}
</style>
