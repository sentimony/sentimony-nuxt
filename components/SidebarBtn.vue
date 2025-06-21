<template>
  <button
    class="SideBarBtn"
    :class="sidebarOpen ? 'is-active' : ''"
    @click="handleClick"
    v-if="$mq === 'sm' || $mq === 'md'"
  >
    <img class="headr__mob-menu-button-img" src="https://content.sentimony.com/assets/img/svg-icons/menu.svg?01">
  </button>
</template>

<script>
  export default {
    computed: {
      sidebarOpen () {
        return this.$store.state.mobmenu.sidebarOpen
      }
    },
    methods: {
      handleClick () {
        this.$store.dispatch('toggleSidebar')
      }
    }
  }
</script>

<style lang="scss">
  .SideBarBtn {
    position: fixed;
    z-index: 2000;
    top: 12px;
    right: 11px;
    padding: 12px;
    height: 50px;
    width: 50px;
    border: 3px solid transparent;
    border-radius: 50%;
    background-color: transparent;
    color: red;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
    transition: transform .3s ease,
                border-color .3s ease;

    // &:focus {
    //   outline: none;
    //   border-color: white;
    // }

    &.is-active {
      outline: none;
      border-color: white;
      transform: rotate(90deg);
    }

    // &.is-active:focus {
    //   border-color: white;
    // }
  }
</style>
