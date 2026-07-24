<script setup lang="ts">
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

const props = withDefaults(defineProps<{
  image_th?: string
  image_xl?: string
  alt?: string
  ratio?: 'square' | 'video'
}>(), { ratio: 'square' })

const isOpen = ref(false)
const open = () => { if (props.image_xl) isOpen.value = true }
const previewImage = computed(() => thumb(props.image_th))

// The preview only fixes a width; height follows the image's real aspect ratio.
const boxClass = computed(() =>
  props.ratio === 'video'
    ? 'w-[160px] sm:w-[280px]'
    : 'w-[100px] sm:w-[190px]'
)
const imgWidth = computed(() => (props.ratio === 'video' ? 280 : 190))

const comingImage = '<div class="p-4 text-[12px] text-white/50">Image is<br>coming ⛄</div>'

async function downloadImage() {
  const url = props.image_xl
  if (!url) return
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const objUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objUrl
    a.download = url.split('/').pop() || 'image.jpg'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(objUrl)
  }
  catch {
    // Cross-origin download can be blocked by CORS; fall back to opening it.
    window.open(url, '_blank', 'noopener')
  }
}

async function copyPath() {
  if (!props.image_xl) return
  try {
    await navigator.clipboard.writeText(props.image_xl)
    toast.success('Image URL copied')
  }
  catch {
    toast.error('Could not copy URL')
  }
}
</script>

<template>
  <DialogRoot v-model:open="isOpen">

    <div
      class="cursor-pointer w-fit mr-4 mb-2 p-[5px] md:p-[10px] rounded-sm transition-[background-color] duration-200 ease-in-out hover:bg-black/10 dark:hover:bg-white/30"
      v-wave
      @click="open"
    >
      <div :class="boxClass" class="shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] rounded-sm overflow-hidden bg-black/30">
        <img
          v-if="previewImage"
          :src="previewImage"
          :alt="alt"
          class="block w-full h-auto object-contain"
          :width="imgWidth"
          loading="lazy"
        />
        <div
          v-else
          class="aspect-square flex items-center justify-center"
          v-html="comingImage"
        />
      </div>
    </div>

    <DialogPortal>
      <DialogOverlay as-child>
        <Overlay class="reka-fade fixed inset-0 z-50" />
      </DialogOverlay>
      <DialogContent
        class="reka-fade fixed inset-0 m-auto z-50 w-fit h-fit max-w-[90vw] max-h-[90vh] flex flex-col items-center gap-3 focus:outline-none"
        v-wave="{
          duration: 3,
          color: 'radial-gradient(closest-side, #fff, #1cb884)',
          initialOpacity: 0.7,
          finalOpacity: 0.3,
          easing: 'cubic-bezier(0,.57,.89,0)'
        }"
      >
        <VisuallyHidden>
          <DialogTitle>{{ alt || 'Image' }}</DialogTitle>
          <DialogDescription>Full-size image preview</DialogDescription>
        </VisuallyHidden>

        <img
          :src="props.image_xl"
          :alt="props.alt || 'Image'"
          class="max-w-[90vw] max-h-[80vh] object-contain rounded-sm shadow-lg"
        />

        <div class="flex flex-wrap items-center justify-center gap-2">
          <DefaultButton iconify="lucide:image-down" title="Download" @click="downloadImage" />
          <DefaultButton :to="props.image_xl" iconify="lucide:arrow-up-right" title="Open" icon-right />
          <DefaultButton iconify="lucide-lab:copy-image" title="Copy Path" @click="copyPath" />
        </div>

        <DialogClose as-child>
          <CloseBtn class="fixed top-0 right-0 mr-2 mt-[18px] z-[60]" />
        </DialogClose>
      </DialogContent>
    </DialogPortal>

  </DialogRoot>
</template>

<style>
@keyframes reka-fade-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes reka-fade-out { from { opacity: 1 } to { opacity: 0 } }
.reka-fade[data-state="open"] { animation: reka-fade-in .2s ease }
.reka-fade[data-state="closed"] { animation: reka-fade-out .2s ease }
</style>
