<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  image_th?: string
  image_xl?: string
  alt?: string
}>()

const isOpen = ref(false)
const open = () => { if (props.image_xl) isOpen.value = true }

const comingImage = '<div class="p-4 text-[12px] text-white/50">Image is<br>coming ⛄</div>'
</script>

<template>
  <DialogRoot v-model:open="isOpen">

    <div
      class="cursor-pointer w-fit mr-4 mb-2 p-[5px] md:p-[10px] rounded-sm transition-[background-color] duration-200 ease-in-out hover:bg-white/30"
      v-wave
      @click="open"
    >
      <div class="size-[100px] sm:size-[190px] shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] rounded-sm overflow-hidden bg-black/30">
        <img
          v-if="image_th"
          :src="image_th"
          :alt="alt"
          class="size-[100px] sm:size-[190px] object-cover"
        />
        <div
          v-else
          v-html="comingImage"
        />
      </div>
    </div>

    <DialogPortal>
      <DialogOverlay class="reka-fade fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" />
      <DialogContent
        class="reka-fade fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-[90vw] max-h-[90vh] rounded-sm focus:outline-none"
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
        </VisuallyHidden>

        <DialogClose
          aria-label="Close"
          class="flex items-center justify-center absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 z-50 cursor-pointer transition ease-in-out duration-300 rounded-[2px] bg-black/40 backdrop-blur-sm hover:bg-white/30 size-[56px] hover:rotate-[360deg]"
          v-wave
        >
          <Icon name="lucide:x" size="22" />
        </DialogClose>

        <img
          :src="props.image_xl"
          :alt="props.alt || 'Image'"
          class="max-w-[90vw] max-h-[90vh] object-contain rounded-sm shadow-lg "
        />
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
