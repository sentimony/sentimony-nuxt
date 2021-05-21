<template>
  <nav class="app-submenu">
    <router-link v-ripple to="/releases/" class="app-submenu__btn" active-class="active" exact>All</router-link>
    <router-link v-ripple to="/releases/darkprog/" class="app-submenu__btn" active-class="active">Dark Prog</router-link>
    <router-link v-ripple to="/releases/psychill/" class="app-submenu__btn" active-class="active">Psychill</router-link>
  </nav>
</template>

<script>
  export default {
  }
</script>

<style lang="scss">
  .app-submenu {
    margin: 20px auto 30px;

    &__btn {
      display: inline-block;
      padding: 10px 18px;
      border-radius: 2px;
      transition: background-color .2s ease;

      &:hover {
        background-color: rgba(#ccc,.4);
      }

      &.active {
        background-color: rgba(#ccc,.4);
      }
    }
  }
</style>
