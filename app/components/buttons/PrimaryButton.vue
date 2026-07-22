<script setup lang="ts">
import { computed, resolveComponent } from 'vue'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  to?: string
  iconify?: string
  img?: string
  svg?: string
  title?: string
}>()

const to = computed(() => props.to?.trim() || '')
const isExternal = computed(() => /^(https?:|mailto:|tel:)/i.test(to.value))

const NuxtLink = resolveComponent('NuxtLink')
const linkTag = computed(() => (isExternal.value ? 'a' : NuxtLink))
const linkProps = computed(() =>
  isExternal.value
    ? { href: to.value, target: '_blank', rel: 'noopener' }
    : { to: to.value },
)
</script>

<template>
  <Button v-if="to" as-child variant="glass" class="mb-2 mr-2 last:mr-0">
    <component :is="linkTag" v-bind="linkProps" v-wave>
      <Icon v-if="iconify" :name="iconify" size="19" />
      <img v-if="img" class="dark:invert" :src="img" :alt="img + ' icon'" width="19" height="19">
      <span v-if="svg" v-html="sanitizeHtml(svg)" />
      <span v-if="title" v-html="sanitizeHtml(title)" />
    </component>
  </Button>
</template>
