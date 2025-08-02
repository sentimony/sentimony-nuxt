import { defineStore } from 'pinia'
import { DB } from '@/services/fireinit'
import { useLoadingStore } from '@/stores/loading.ts'

export const useSocialStore = defineStore('social', {
  state: () => ({
    loadedSocial: []
  }),

  actions: {
    async loadSocial() {
      const loadingStore = useLoadingStore()
      try {
        loadingStore.setLoading(true)

        const data = await DB.ref('social').once('value')
        const obj = data.val()
        const social = []

        for (const key in obj) {
          social.push({
            id: key,
            icon: obj[key].icon,
            isVisibleHeadr: obj[key].isVisibleHeadr,
            isVisibleContacts: obj[key].isVisibleContacts,
            isVisibleFootr: obj[key].isVisibleFootr,
            title: obj[key].title,
            url: obj[key].url
          })
        }

        this.loadedSocial = social
      } catch (error) {
        console.error('loadSocial error:', error)
      } finally {
        loadingStore.setLoading(false)
      }
    }
  }
})
