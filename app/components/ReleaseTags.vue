<script setup lang="ts">
import type { Tag } from '~/types'

const props = defineProps<{
  releaseSlug: string
}>()

const { data: tags } = await useReleaseTags(props.releaseSlug)

// Group tags by type
const tagsByType = computed(() => {
  if (!tags.value) return []

  const groups = new Map<string, { type: any; tags: Tag[] }>()

  for (const tag of tags.value) {
    const typeSlug = tag.type?.slug || 'other'
    if (!groups.has(typeSlug)) {
      groups.set(typeSlug, { type: tag.type, tags: [] })
    }
    groups.get(typeSlug)!.tags.push(tag)
  }

  // Sort by type sort_order
  return Array.from(groups.values()).sort(
    (a, b) => (a.type?.sort_order || 0) - (b.type?.sort_order || 0)
  )
})

const hasTags = computed(() => tags.value && tags.value.length > 0)
</script>

<template>
  <div v-if="hasTags">
    <hr class="my-4 border-black/30">
    <p><small><b>Tags:</b></small></p>

    <div v-for="group in tagsByType" :key="group.type?.slug" class="mb-3">
      <p class="text-xs text-black/50 mb-1">{{ group.type?.title_plural || 'Other' }}</p>
      <div class="flex flex-wrap gap-2">
        <TagBadge
          v-for="tag in group.tags"
          :key="tag.slug"
          :tag="tag"
        />
      </div>
    </div>
  </div>
</template>
