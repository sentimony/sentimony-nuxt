<script setup lang="ts">
defineProps<{
  loading: boolean
  hasMore: boolean
  remaining: number
  empty?: boolean
}>()

defineEmits<{
  loadMore: []
}>()
</script>

<template>
  <div v-if="loading" class="flex justify-center py-10">
    <span class="animate-pulse text-[10px] uppercase tracking-widest text-foreground/30 motion-reduce:animate-none">
      Loading
    </span>
  </div>

  <p
    v-else-if="empty"
    class="py-16 text-center text-[10px] uppercase tracking-[0.2em] text-foreground/25"
  >
    Nothing saved here yet
  </p>

  <button
    v-if="hasMore"
    type="button"
    :disabled="loading"
    class="mx-auto mt-6 block rounded px-3 py-2 text-[10px] uppercase tracking-widest text-foreground/35 transition-colors duration-200 hover:bg-black/5 hover:text-foreground/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-25 dark:hover:bg-white/5"
    @click="$emit('loadMore')"
  >
    {{ loading ? 'Loading…' : `Show more · ${remaining} left` }}
  </button>
</template>
