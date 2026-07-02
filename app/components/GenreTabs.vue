<template>
  <div class="flex gap-2 mb-6">
    <NuxtLink
      to="/releases"
      class="px-3 py-1 rounded-full text-sm border border-white/20 hover:border-white/50 transition-colors"
      exact-active-class="border-white/60 text-white"
    >
      All
    </NuxtLink>
    <NuxtLink
      to="/releases/psytrance"
      class="px-3 py-1 rounded-full text-sm border border-white/20 hover:border-white/50 transition-colors"
      exact-active-class="border-white/60 text-white"
    >
      Psytrance
    </NuxtLink>
    <NuxtLink
      to="/releases/psychill"
      class="px-3 py-1 rounded-full text-sm border border-white/20 hover:border-white/50 transition-colors"
      exact-active-class="border-white/60 text-white"
    >
      Psychill
    </NuxtLink>
  </div>
</template>
