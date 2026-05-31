<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner"
import { Toaster as Sonner } from "vue-sonner"
import { cn } from "@/lib/utils"

const props = defineProps<ToasterProps>()
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
    }"
    v-bind="props"
  >
    <template #success-icon>
      <Icon name="heroicons:check-circle" class="size-4" />
    </template>
    <template #info-icon>
      <Icon name="heroicons:information-circle" class="size-4" />
    </template>
    <template #warning-icon>
      <Icon name="heroicons:exclamation-triangle" class="size-4" />
    </template>
    <template #error-icon>
      <Icon name="heroicons:x-circle" class="size-4" />
    </template>
    <template #loading-icon>
      <div>
        <Icon name="heroicons:arrow-path" class="size-4 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <Icon name="heroicons:x-mark" class="size-4" />
    </template>
  </Sonner>
</template>
