<script setup lang="ts">
import { profileSections } from '~/utils/profileSections'

definePageMeta({ middleware: 'auth' })

useSeoMeta({ title: 'Profile' })

const route = useRoute()
const { data: summary } = await useProfileSummary()

const totalSaved = computed(() =>
  profileSections.reduce(
    (total, section) => total + (summary.value?.[section.key] ?? 0),
    0,
  )
)

const visibleSections = computed(() =>
  profileSections.filter(section => (summary.value?.[section.key] ?? 0) > 0)
)

const profileNavItems = computed(() => [
  {
    key: 'profile',
    label: 'Profile',
    icon: 'lucide:circle-user-round',
    count: totalSaved.value,
  },
  ...visibleSections.value.map(section => ({
    ...section,
    count: summary.value?.[section.key] ?? 0,
  })),
])

const isSectionActive = (key: string) => key === 'profile'
  ? route.path === '/profile'
  : route.path === `/profile/${key}`
</script>

<template>
  <main class="px-4 py-10 sm:py-12">
    <div class="container mx-auto max-w-[112rem]">
      <nav
        v-if="profileNavItems.length"
        aria-label="Profile collection"
        class="mx-auto mb-10 flex max-w-5xl flex-wrap justify-center gap-2"
      >
        <NuxtLink
          v-for="section in profileNavItems"
          :key="section.key"
          :to="section.key === 'profile' ? '/profile' : `/profile/${section.key}`"
          class="inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-[10px] uppercase tracking-widest transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          :class="isSectionActive(section.key)
            ? 'bg-black/15 text-foreground dark:bg-white/15'
            : 'bg-black/5 text-foreground/40 hover:bg-black/10 hover:text-foreground/70 dark:bg-white/5 dark:hover:bg-white/10'"
        >
          <Icon :name="section.icon" size="16" />
          {{ section.label }}
          <span class="font-mono text-[9px] opacity-45">
            {{ section.count }}
          </span>
        </NuxtLink>
      </nav>

      <NuxtPage />
    </div>
  </main>
</template>
