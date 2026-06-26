<script setup lang="ts">
const { data: summary } = await useProfileSummary()
</script>

<template>
  <ProfileCollectionPage
    title="events"
    endpoint="/api/event-likes/events"
    category="event"
    :initial-total="summary?.events ?? 0"
  />
</template>
