<script setup lang="ts">
const { data: summary } = await useProfileSummary()
</script>

<template>
  <ProfileCollectionPage
    title="playlists"
    endpoint="/api/playlist-likes/playlists"
    category="playlist"
    :initial-total="summary?.playlists ?? 0"
  />
</template>
