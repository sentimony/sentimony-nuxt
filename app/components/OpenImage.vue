<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  image_th?: string
  image_xl?: string
  alt?: string
}>()

const isOpen = ref(false)
const open = () => { if (props.image_xl) isOpen.value = true }
const close = () => { isOpen.value = false }

const comingImage = '<div class="p-4 text-[12px] text-white/50">Image is<br>coming ⛄</div>'

// Close on Escape key
function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return
  if (e.key === 'Escape' || e.key === 'Esc') {
    e.preventDefault()
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div>

    <div
      class="cursor-pointer size-[100px] sm:size-[190px] mr-4 mb-2 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] rounded-sm overflow-hidden bg-black/30"
      v-wave
      @click="open"
    >
      <img
        v-if="image_th"
        :src="image_th"
        :alt="alt"
        class=" size-[100px] sm:size-[190px] object-cover"
      />
      <div
        v-else
        v-html="comingImage"
      />
    </div>

    <Transition name="modal-fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">

        <!-- <Transition name="backdrop-fade"> -->
          <div
            class="absolute inset-0 bg-black/30 backdrop-blur-sm"
            @click="close"
            v-wave
          />
        <!-- </Transition> -->

        <!-- <Transition name="modal-zoom"> -->
          <div
            class="relative max-w-[90vw] max-h-[90vh] rounded-sm"
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
              class="flex items-center justify-center fixed top-0 right-0 mr-2 mt-[9px] z-50 cursor-pointer transition ease-in-out duration-300 rounded-[2px] hover:bg-white/30 size-[56px] hover:rotate-[360deg]"
              @click="close"
              v-wave
            >
              <Icon name="i-fa7-solid:close" size="22" />
            </button>

            <img
              :src="props.image_xl"
              :alt="props.alt || 'Image'"
              class="max-w-[90vw] max-h-[90vh] object-contain rounded-sm shadow-lg "
            />

            <!-- <img
              :src="props.image_xl"
              :alt="props.alt || 'Image'"
              class="absolute left-0 right-0 max-w-[90vw] max-h-[90vh] object-contain rounded-sm shadow-lg "
            />

            <img
              :src="props.image_th"
              :alt="props.alt || 'Image'"
              class="max-w-[90vw] max-h-[90vh] w-[90vw] h-auto  object-contain rounded-sm shadow-lg "
            /> -->
          </div>
        <!-- </Transition> -->

      </div>
    </Transition>

  </div>
</template>

<style lang="scss">
// Modal transitions
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

// .backdrop-fade-enter-active, .backdrop-fade-leave-active { transition: opacity .2s ease; }
// .backdrop-fade-enter-from, .backdrop-fade-leave-to { opacity: 0; }

// .modal-zoom-enter-active, .modal-zoom-leave-active { transition: opacity .2s ease, transform .2s ease; }
// .modal-zoom-enter-from, .modal-zoom-leave-to { opacity: 0; transform: scale(0.97); }
</style>
