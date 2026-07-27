<script setup lang="ts">
import { profileSections } from '~/utils/profileSections'

definePageMeta({ middleware: 'auth' })

useSeoMeta({ title: 'Profile' })

const { data: summary } = await useProfileSummary()

const totalSaved = computed(() =>
  profileSections.reduce(
    (total, section) => total + (summary.value?.[section.key] ?? 0),
    0,
  )
)

const profileNavItems = computed(() => [
  {
    key: 'profile',
    label: 'Profile',
    icon: 'lucide:square-user-round',
    count: totalSaved.value,
  },
  ...profileSections.map(section => ({
    ...section,
    count: summary.value?.[section.key] ?? 0,
  })),
])
</script>

<template>
  <main class="px-4 py-10 sm:py-12">
    <div class="container mx-auto max-w-5xl">
      <nav
        aria-label="Profile collection"
        class="mx-auto mb-10 flex flex-wrap justify-center gap-2"
      >
        <DefaultButton
          v-for="section in profileNavItems"
          :key="section.key"
          :to="section.key === 'profile' ? '/profile' : `/profile/${section.key}`"
          :iconify="section.icon"
          :title="section.label"
          :count="section.count"
          small
          outline
        />
      </nav>

      <NuxtPage />
    </div>
  </main>
</template>
