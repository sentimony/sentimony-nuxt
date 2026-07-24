<script setup lang="ts">
import { Button } from '@/components/ui/button'

withDefaults(defineProps<{
  size?: number
}>(), { size: 18 })
</script>

<template>
  <Button
    type="button"
    variant="outline"
    aria-label="Close"
    class="flex items-center justify-center size-9 p-0 cursor-pointer rounded-md border bg-white/20 border-black/30 dark:border-white/20 backdrop-blur-sm transition-[background-color,border-color,rotate] ease-in-out duration-300 hover:bg-white/30 hover:border-black/50 dark:hover:border-white/30 hover:rotate-[360deg]"
    v-wave
  >
    <Icon name="lucide:x" :size="size" />
  </Button>
</template>
