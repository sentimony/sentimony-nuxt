<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  image_th?: string
  image_xl?: string
  alt?: string
}>()

const isOpen = ref(false)
const open = () => { if (props.image_xl) isOpen.value = true }
const close = () => { isOpen.value = false }

const comingImage = '<div class="p-4 text-[12px] text-white/50">Image is<br>coming ⛄</div>'
</script>

<template>
  <div>

    <div 
      class="cursor-pointer size-[100px] sm:size-[190px] mr-4 mb-2 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] rounded-sm overflow-hidden bg-black/50"
      v-wave
      @click="open"
    >
      <img
        v-if="image_th"
        :src="image_th"
        class=""
        :alt="alt"
      />
      <div
        v-else
        v-html="comingImage"
      />
    </div>

    <Transition name="modal-fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <Transition name="backdrop-fade">
          <div 
            class="absolute inset-0 bg-black/70 backdrop-blur-sm" 
            @click="close"
            v-wave
          />
        </Transition>
        <Transition name="modal-zoom">
          <div 
            class="relative max-w-[98vw] max-h-[98vh] rounded-md" 
            @click.stop 
            v-wave="{
              duration: 3,
              color: 'radial-gradient(closest-side, #fff, #1cb884)',
              initialOpacity: 0.7,
              finalOpacity: 0.3,
              easing: 'cubic-bezier(0,.57,.89,0)'
            }"
          >
            <button
              type="button"
              aria-label="Close"
              class="fixed top-0 right-0 mr-2 mt-[9px] w-[56px] h-[56px] rounded-full bg-white/90 text-black flex items-center justify-center shadow hover:bg-white"
              @click="close"
              v-wave
            >
              <Icon name="i-fa7-solid:close" size="22" />
            </button>
            <img
              :src="props.image_xl"
              :alt="props.alt || 'Image'"
              class="max-w-[98vw] max-h-[98vh] object-contain rounded-md shadow-lg "
            />
            <!-- <img
              :src="props.image_xl"
              :alt="props.alt || 'Image'"
              class="absolute left-0 right-0 max-w-[98vw] max-h-[98vh] object-contain rounded-md shadow-lg "
            />
            <img
              :src="props.image_th"
              :alt="props.alt || 'Image'"
              class="max-w-[98vw] max-h-[98vh] w-[98vw] h-auto  object-contain rounded-md shadow-lg "
            /> -->
          </div>
        </Transition>
      </div>
    </Transition>

  </div>
</template>

<style lang="scss">
// Modal transitions
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.backdrop-fade-enter-active, .backdrop-fade-leave-active { transition: opacity .2s ease; }
.backdrop-fade-enter-from, .backdrop-fade-leave-to { opacity: 0; }

.modal-zoom-enter-active, .modal-zoom-leave-active { transition: opacity .2s ease, transform .2s ease; }
.modal-zoom-enter-from, .modal-zoom-leave-to { opacity: 0; transform: scale(1.97); }
</style>

