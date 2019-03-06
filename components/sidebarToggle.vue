<template>
  <button class="button" :class="sidebarOpen ? 'is-active' : ''" @click="handleClick">
    <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
    </svg>
  </button>
</template>

<script>
  export default {
    // name: 'sidebar-toggle',
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

<style>
  .button {
    position: fixed;
    z-index: 2000;
    top: 1rem;
    right: 1rem;
    padding: 0;
    height: 50px;
    width: 50px;
    border: 3px solid transparent;
    border-radius: 50%;
    background-color: blue;
    color: red;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
    transition: transform 300ms ease-out, border-color 300ms ease-out;
  }

  .button svg {
    height: 100%;
    width: 100%;
    fill: green;
    transition: fill 300ms ease-out;
  }

  .button:focus {
    outline: none;
    border-color: white;
  }

  .button.is-active {
    transform: rotate(45deg);
  }

  .button.is-active svg{
    fill: yellow;
  }

  .button.is-active:focus{
    border-color: blue;
  }

</style>
