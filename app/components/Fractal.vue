<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  contained?: boolean
}>(), { contained: false })

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
  <div
    aria-hidden="true"
    :class="contained ? 'absolute inset-0' : 'fixed inset-0'"
  >
    <div
      data-fractal-orbit
      class="absolute inset-0 motion-reduce:animate-none!"
      :class="{ 'animate-[spin2_6.0s_ease-in-out]': isAnimating }"
    >
      <div
        v-for="petal in petalRotations"
        :key="petal.id"
        class="absolute top-1/2 left-1/2 origin-[0] -translate-x-1/2 -translate-y-1/2 rotate-(--petal-rotation)"
        :style="{
          '--petal-rotation': `${petal.rotation}deg`,
        }"
      >
        <div
          class="absolute transform-[translate3d(4rem,8rem,0)] transition-transform duration-[1.2s] ease-in-out motion-reduce:transition-none!"
          :class="{ 'transform-[translate3d(8rem,4rem,0)]! duration-[4s]! will-change-transform': isAnimating }"
        >
          <div
            class="absolute motion-reduce:animate-none!"
            :class="{ 'animate-[spin2rev_6.0s_ease-in-out] will-change-transform': isAnimating }"
          >
            <div
              class="absolute transform-[scale3d(0.666666667,1.333333333,1)] transition-transform duration-[1.2s] ease-in-out motion-reduce:transition-none!"
              :class="{ 'transform-[scale3d(1.333333333,0.666666667,1)]! duration-[4s]! will-change-transform': isAnimating }"
            >
              <div
                class="absolute -top-24 -left-24 size-48 rounded-full [background:var(--petal-gradient)]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
