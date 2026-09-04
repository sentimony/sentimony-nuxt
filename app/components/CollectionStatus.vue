<script setup lang="ts">
import { ref, watch } from 'vue'
import { collectionAnnouncement, type CollectionState } from '~/utils/collectionAnnouncement'

const props = withDefaults(defineProps<{
  loading: boolean
  loaded: boolean
  hasMore?: boolean
  remaining?: number
  empty?: boolean
  error?: boolean
  emptyText?: string
}>(), {
  hasMore: false,
  remaining: 0,
  emptyText: 'Nothing saved here yet',
})

defineEmits<{
  loadMore: []
  retry: []
}>()

// The error branch announces itself via role="alert"; everything else goes
// through one always-mounted status region so retries and pagination are heard.
const snapshot = (): CollectionState => ({
  loading: props.loading,
  loaded: props.loaded,
  error: props.error ?? false,
  empty: props.empty ?? false,
  hasMore: props.hasMore,
  remaining: props.remaining,
  emptyText: props.emptyText,
})
const statusText = ref(collectionAnnouncement(snapshot()))
watch(snapshot, (next, previous) => {
  statusText.value = collectionAnnouncement(next, previous)
})
</script>

<template>
  <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ statusText }}</p>

  <div
    v-if="error"
    role="alert"
    class="py-16 text-center"
  >
    <p class="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
      Could not load this collection
    </p>
    <Button
      type="button"
      variant="default"
      :disabled="loading"
      class="mx-auto mt-6 text-[10px] uppercase tracking-widest"
      @click="$emit('retry')"
    >
      {{ loading ? 'Retrying…' : 'Try again' }}
    </Button>
  </div>

  <div v-else-if="loading && !loaded" class="flex justify-center py-10">
    <span class="animate-pulse text-[10px] uppercase tracking-widest text-muted-foreground motion-reduce:animate-none">
      Loading
    </span>
  </div>

  <p
    v-else-if="empty"
    class="py-16 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
  >
    {{ emptyText }}
  </p>

  <Button
    v-else-if="hasMore"
    type="button"
    variant="default"
    :disabled="loading"
    class="mx-auto mt-6 text-[10px] uppercase tracking-widest"
    @click="$emit('loadMore')"
  >
    {{ loading ? 'Loading…' : `Show more · ${remaining} left` }}
  </Button>
</template>
