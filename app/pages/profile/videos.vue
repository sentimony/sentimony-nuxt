<script setup lang="ts">
const { data: summary } = await useProfileSummary()
</script>

<template>
  <ProfileCollectionPage
    title="videos"
    endpoint="/api/video-likes/videos"
    category="video"
    :initial-total="summary?.videos ?? 0"
  />
</template>
