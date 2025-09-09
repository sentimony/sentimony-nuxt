<script setup lang="ts">
const mobmenu = useMobmenuStore()
</script>

<template>
  <div
    class="flex items-center justify-center fixed top-0 right-0 mr-2 mt-[9px] z-50 cursor-pointer transition ease-in-out duration-300 rounded-[2px] hover:bg-white/30 size-[56px]"
    :class="mobmenu.sidebarOpen ? 'bg-white/20 rotate-[360deg]' : ''"
    @click="mobmenu.toggleSidebar"
    v-wave
  >
    <Icon
      name="fa7-solid:navicon"
      size="22"
      :class="mobmenu.sidebarOpen ? 'hidden' : ''"

    />
    <Icon
      name="fa7-solid:close"
      size="22"
      :class="mobmenu.sidebarOpen ? '' : 'hidden'"
    />
  </div>
</template>

<style lang="scss"></style>
