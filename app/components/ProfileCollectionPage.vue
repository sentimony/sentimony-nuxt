<script setup lang="ts">
import type { ItemCategory, ItemEntity } from '~/types'

const props = defineProps<{
  title: string
  endpoint: string
  category: ItemCategory
  initialTotal: number
}>()

const collection = usePaginatedLikes<ItemEntity>(
  props.endpoint,
  25,
  props.initialTotal,
)

await collection.ensureLoaded()
</script>

<template>
  <section :aria-labelledby="`${category}-collection-title`" class="min-h-48">
    <h1
      :id="`${category}-collection-title`"
      class="sr-only"
    >
      Liked {{ title }}
    </h1>

    <div v-if="collection.items.value.length" class="flex flex-wrap justify-center">
      <Item
        v-for="item in collection.items.value"
        :key="item.slug"
        :i="item"
        :category="category"
      />
    </div>

    <CollectionStatus
      :loading="collection.loading.value"
      :loaded="collection.loaded.value"
      :has-more="collection.hasMore.value"
      :remaining="collection.total.value - collection.items.value.length"
      :empty="collection.loaded.value && collection.items.value.length === 0"
      :error="collection.error.value"
      @load-more="collection.loadMore()"
      @retry="collection.retry()"
    />
  </section>
</template>
