<script setup lang="ts">
import type { Release } from '~/types'
import { matchesGenre } from '~/utils/releaseGenres'

const { data: releasesRaw } = await useReleases()
const releases = computed(() => toArray<Release>(releasesRaw.value, 'releases'))
const visible = computed(() => releases.value.filter(r => r.visible))
const counts = computed(() => ({
  all: visible.value.length,
  psytrance: visible.value.filter(r => matchesGenre(r.style, 'psytrance')).length,
  psychill: visible.value.filter(r => matchesGenre(r.style, 'psychill')).length,
  ungrouped: visible.value.filter(r => matchesGenre(r.style, 'ungrouped')).length,
}))
</script>

<template>
  <div class="flex flex-wrap justify-center gap-2 mb-4">
    <DefaultButton to="/releases/all" title="All" :count="counts.all" small outline />
    <DefaultButton to="/releases/psytrance" title="Psytrance" :count="counts.psytrance" small outline />
    <DefaultButton to="/releases/psychill" title="Psychill" :count="counts.psychill" small outline />
    <DefaultButton to="/releases/ungrouped" title="Ungrouped" :count="counts.ungrouped" small outline />
  </div>
</template>
