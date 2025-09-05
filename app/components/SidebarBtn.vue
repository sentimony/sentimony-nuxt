<script setup lang="ts">
const mobmenu = useMobmenuStore()
</script>

<template>
  <div 
    class="SidebarBtn transition-all ease-in-out duration-300 hover:bg-white/30 mr-2"
    :class="mobmenu.sidebarOpen ? 'isActive bg-white/20' : ''"
    @click="mobmenu.toggleSidebar"
    v-wave
  >
    <img 
      class="w-[22px]" 
      src="https://content.sentimony.com/assets/img/svg-icons/menu.svg?01"
    >
  </div>
</template>

<style lang="scss">
.SidebarBtn {
  position: fixed;
  z-index: 2000;
  top: 9px;
  right: 0;
  padding: 12px;
  height: 56px;
  width: 56px;
  border: 2px solid transparent;
  border-radius: 50%;
  // background-color: transparent;
  color: red;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  // transition: transform .3s ease,
  //             border-color .3s ease;

  // &:focus {
  //   outline: none;
  //   border-color: white;
  // }

  &.isActive {
    outline: none;
    border-color: white;  
    transform: rotate(180deg);
  }

  // &.is-active:focus {
  //   border-color: white;
  // }
}
</style>
