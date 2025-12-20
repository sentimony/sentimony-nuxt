<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const route = useRoute()
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
  <div class="fixed inset-0 overflow-hidden">
    <div
      v-for="petal in petalRotations"
      :key="petal.id"
      class="absolute top-1/2 left-1/2 origin-[0]"
      :style="{
        transform: `translate3d(-50%, -50%, 0) rotate(${petal.rotation}deg)`,
        transition: 'all 6.0s ease-in-out',
      }"
    >
      <div
        class="absolute w-32 h-64 rounded-full origin-center"
        :class="{ 'animate-fractal-turn': isAnimating }"
        :style="{
          background: 'radial-gradient(ellipse at 50% 0, rgba(255, 255, 255, 0.05) 0%, rgba(138, 2, 2, 0) 50%, rgba(0, 0, 0, 0.33) 100%)',
          transition: 'all 6.0s ease-in-out',
        }"
      />
    </div>
  </div>
</template>

<style>
@keyframes fractal-turn {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-fractal-turn {
  animation: fractal-turn 6.0s ease-in-out;
}
</style>
