<script setup lang="ts">
const { data: summary } = await useProfileSummary()
</script>

<template>
  <ProfileCollectionPage
    title="releases"
    endpoint="/api/likes/releases"
    category="release"
    :initial-total="summary?.releases ?? 0"
  />
</template>
