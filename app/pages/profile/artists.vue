<script setup lang="ts">
const { data: summary } = await useProfileSummary()
</script>

<template>
  <ProfileCollectionPage
    title="artists"
    endpoint="/api/artist-likes/artists"
    category="artist"
    :initial-total="summary?.artists ?? 0"
  />
</template>
