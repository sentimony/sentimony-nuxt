<script setup lang="ts">
const mobmenu = useMobmenuStore()
</script>

<template>
  <div
    class="fixed left-full top-0 w-screen h-screen z-30 bg-black/30 backdrop-blur-sm"
    :class="mobmenu.sidebarOpen ? '-translate-x-full' : ''"
    @click="mobmenu.toggleSidebar"
  />
</template>

<style lang="scss"></style>
