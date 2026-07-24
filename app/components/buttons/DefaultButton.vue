<script setup lang="ts">
import { computed, resolveComponent } from 'vue'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  to?: string
  iconify?: string
  img?: string
  svg?: string
  title?: string
  count?: number
  small?: boolean
  outline?: boolean
  iconRight?: boolean
}>()

const emit = defineEmits<{ click: [MouseEvent] }>()

const to = computed(() => props.to?.trim() || '')
const isExternal = computed(() => /^(https?:|mailto:|tel:)/i.test(to.value))
const isAction = computed(() => !to.value)

const extraClass = computed(() => [
  props.small && 'h-[30px] px-3',
  props.outline && 'border-black/25 dark:border-white/25',
])

const NuxtLink = resolveComponent('NuxtLink')
const linkTag = computed(() => (isAction.value ? 'button' : isExternal.value ? 'a' : NuxtLink))
const linkProps = computed(() =>
  isAction.value
    ? { type: 'button' }
    : isExternal.value
      ? { href: to.value, target: '_blank', rel: 'noopener' }
      : { to: to.value, exactActiveClass: 'bg-white/20 border-black/30 dark:border-white/20' },
)
</script>

<template>
  <Button as-child variant="default" :class="extraClass">
    <component :is="linkTag" v-bind="linkProps" v-wave @click="emit('click', $event)">
      <Icon v-if="iconify && !iconRight" :name="iconify" size="18" />
      <img v-if="img" class="dark:invert" :src="img" :alt="img + ' icon'" width="18" height="18">
      <span v-if="svg" v-html="sanitizeHtml(svg)" />
      <span v-if="title" v-html="sanitizeHtml(title)" />
      <Icon v-if="iconify && iconRight" :name="iconify" size="18" />
      <span v-if="count != null" class="font-mono text-[0.85em] opacity-60">·   {{ count }}</span>
    </component>
  </Button>
</template>
