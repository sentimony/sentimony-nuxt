import { defineStore } from 'pinia'

export const useMobmenuStore = defineStore('mobmenu', {
  state: () => ({
    sidebarOpen: false
  }),

  actions: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    }
  }
})