<script setup lang="ts">
import { Button } from '@/components/ui/button'

const props = withDefaults(defineProps<{
  liked: boolean
  count: number
  size?: 'sm' | 'lg'
}>(), { size: 'sm' })

defineEmits<{
  like: []
}>()

const variant = computed(() => (props.size === 'lg' ? 'glass' : 'soft'))
const iconSize = computed(() => (props.size === 'lg' ? '19' : '18'))
</script>

<template>
  <Button
    :variant="variant"
    @click="$emit('like')"
    v-wave
  >
    <Icon name="lucide:thumbs-up" :size="iconSize" />
    {{ liked ? 'Liked' : 'Like' }}
    <span v-if="count > 0" class="opacity-50">{{ count }}</span>
  </Button>
</template>
