export default defineNuxtPlugin(() => {
  if (import.meta.dev) {
    return
  }

  if (!('serviceWorker' in navigator)) {
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/custom-sw.js', { scope: '/' }).catch((error) => {
      console.error('Service worker registration failed:', error)
    })
  })
})
