<script setup lang="ts">
const heroTitle = 'Sentimony<br>'
const heroSubTitle = '<span>R</span><span>e</span><span>c</span><span>o</span><span>r</span><span>d</span><span>s</span>'
const heroDescription = 'Psychedelic Music Label'

const shapeRef = ref<HTMLElement | null>(null)
let stopPointerTracking: (() => void) | undefined

onMounted(() => {
  const shape = shapeRef.value
  if (!shape) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!window.matchMedia('(pointer: fine)').matches) return

  const target = { x: 0, y: 0 }
  const current = { x: 0, y: 0 }
  let frame = 0

  const glide = () => {
    current.x += (target.x - current.x) * 0.05
    current.y += (target.y - current.y) * 0.05
    shape.style.setProperty('--shape-x', `${current.x.toFixed(2)}px`)
    shape.style.setProperty('--shape-y', `${current.y.toFixed(2)}px`)
    const settled = Math.abs(target.x - current.x) < 0.1 && Math.abs(target.y - current.y) < 0.1
    frame = settled ? 0 : requestAnimationFrame(glide)
  }

  const onPointerMove = (event: PointerEvent) => {
    target.x = (event.clientX / window.innerWidth - 0.5) * 180
    target.y = (event.clientY / window.innerHeight - 0.5) * 120
    if (!frame) frame = requestAnimationFrame(glide)
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  stopPointerTracking = () => {
    cancelAnimationFrame(frame)
    window.removeEventListener('pointermove', onPointerMove)
  }
})

onBeforeUnmount(() => stopPointerTracking?.())
</script>

<template>
  <div
    data-testid="homepage-hero"
    class="font-julius relative leading-[1.4] text-foreground bg-gradient-to-b from-transparent via-transparent to-white/50 dark:to-black/50
    py-[7.5em]
    sm:py-[8.5em]
    md:py-[9.5em]
    lg:py-[10.5em]
    xl:py-[11.5em]"
  >
    <div class="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div ref="shapeRef" class="hero-shape" />
    </div>
    <div class="relative max-w-[777px] px-2 box-border mx-auto">
      <div
        class="uppercase mb-[0.2em]
        text-[40px] tracking-[2px]
        sm:text-[55px] sm:tracking-[5px]
        md:text-[70px] md:tracking-[8px]
        lg:text-[85px] lg:tracking-[11px]
        xl:text-[100px] xl:tracking-[14px]"
      >
        
        <div v-html="heroTitle"/>

        <div
          class="tracking-normal flex justify-center 
          md:gap-3.5"
          v-html="heroSubTitle"
        />

      </div>
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

<style>
.hero-shape {
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(72vmin, 720px);
  aspect-ratio: 1.2;
  border-radius: 50%;
  transform: translate(calc(-50% + var(--shape-x, 0px)), calc(-50% + var(--shape-y, 0px)));
  background: radial-gradient(
    closest-side,
    oklch(1 0 0 / 75%) 0%,
    oklch(0.96 0.012 155 / 38%) 48%,
    transparent 100%
  );
  filter: blur(36px);
  will-change: transform;
}

.dark .hero-shape {
  background: radial-gradient(
    closest-side,
    oklch(0.34 0.05 155 / 45%) 0%,
    oklch(0.22 0.035 155 / 22%) 52%,
    transparent 100%
  );
}
</style>
